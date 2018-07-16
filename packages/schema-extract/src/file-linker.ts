import * as ts from 'typescript';
import { transform } from '../src/file-transformer';
import { Schema, IObjectFields, ClassSchemaId, ClassSchema, ModuleSchema, isRef, isSchemaOfType, isClassSchema } from './json-schema-types';

export class SchemaLinker {
    private checker: ts.TypeChecker;
    private program: ts.Program;

    constructor(program: ts.Program, checker: ts.TypeChecker) {
        this.checker = checker;
        this.program = program;
    }

    public flatten(file: string, name: string, moduleId: string): Schema {
        const schema = transform(this.checker, this.program.getSourceFile(file)!, '/src/' + moduleId, '/someProject');
        if (!schema.definitions) {
            return {};
        }
        const entity = schema.definitions[name];
        if (!entity) {
            return {};
        }
        return link(entity, schema);
    }
}

function link(entity: Schema, schema: ModuleSchema): Schema {
    if (isClassSchema(entity)) {
        return linkClass(schema, entity);
    }
    if (isRef(entity)) {
        // need to slice according to #?
        const entityType = entity.$ref.replace('#', '');
        const refEntity = schema.definitions![entityType];
        if (!refEntity || !refEntity.genericParams || !entity.genericArguments) {
            return entity;
        }
        if (isSchemaOfType('object', refEntity)) {
            const pMap = new Map();
            refEntity.genericParams!.forEach((param, index) => {
                pMap.set(`#${entityType}!${param.name}`, entity.genericArguments![index]);
            });
            return linkObject(entity, entityType, refEntity, pMap, schema);
        } else {
            return entity;
        }
    }
    if (entity.$allOf) {
        const res = handleIntersection(entity.$allOf, schema);
        res.type = 'object';
        return res;
    }
    return entity;
}

function handleIntersection(options: Schema[], schema: ModuleSchema, paramsMap?: Map<string, Schema>): Schema {
    const res: Schema & IObjectFields = {properties: {}};
    for (const option of options) {
        if (isRef(option)) {
            let entity: Schema & IObjectFields;
            if (paramsMap) {
                // need to check if entity is defined
                entity = paramsMap!.get(option.$ref)!;
            } else {
                const refEntity = option.genericArguments ? option : schema.definitions![option.$ref!.replace('#', '')];
                entity = link(refEntity, schema);
            }
            /*

            What about additionalProperties????

            */
            if (entity.properties) {
                res.type = entity.type;
                const properties = entity.properties;
                for (const prop in properties) {
                    if (!res.properties!.hasOwnProperty(prop)) {
                        res.properties![prop] = properties[prop];
                    } else {
                        // ?????
                        res.properties![prop] = handleIntersection([res.properties![prop], properties[prop]], schema);
                    }
                }
            }
        } else if (isSchemaOfType('object', option)) {
            if (option.properties) {
                res.type = option.type;
                const properties = option.properties;
                for (const prop in properties) {
                    if (!res.properties!.hasOwnProperty(prop)) {
                        res.properties![prop] = properties[prop];
                    }
                }
            }
        }
    }
    return res;
}

// function handleUnion(options: Schema[], schema: ModuleSchema): Schema {
//     const res: Schema & IObjectFields = {properties: {}};
//     const propArray = [];
//     for (const option of options) {
//         if (isRef(option)) {
//             const refEntity = schema.definitions![option.$ref!.replace('#', '')];
//             const entity: IObjectFields = link(refEntity, schema);
//             if (entity.properties) {
//                 const properties = entity.properties;
//                 for (const prop in properties) {
//                     if (!res.properties!.hasOwnProperty(prop)) {
//                         res.properties![prop] = properties[prop];
//                     } else {
//                         if (isUnion(res.properties![prop])) {
//                             res.properties![prop].$oneOf!.push(properties[prop]);
//                         }
//                         res.properties![prop] = {$oneOf: [res.properties![prop], properties[prop]]};
//                     }
//                 }
//             }
//         }
//         // } else if (isUnion(option)) {
//         //     res.push({$oneOf: handleUnion(option.$oneOf, schema)});
//         // }
//     }
//     return res;
// }

function linkClass(schema: ModuleSchema, entity: ClassSchema): ClassSchema {
    if (!schema.definitions || !entity.extends) {
        return entity;
    }
    const extendedEntity = entity.extends.$ref!.replace('#', '');
    const refEntity = schema.definitions[extendedEntity] as ClassSchema;
    const res = {
        $ref: ClassSchemaId,
        extends: {$ref: entity.extends.$ref},
        properties: {},
        staticProperties: {}
    } as ClassSchema;
    if (entity.hasOwnProperty('constructor')) {
        res.constructor = Object.assign({}, entity.constructor);
    } else if (refEntity.hasOwnProperty('constructor')) {
        res.constructor = Object.assign({}, refEntity.constructor);
    }
    res.properties = extractClassData(entity, refEntity, extendedEntity, 'properties');
    res.staticProperties = extractClassData(entity, refEntity, extendedEntity, 'staticProperties');
    if (entity.genericParams) {
        res.genericParams = entity.genericParams;
    }
    return res;
}

function extractClassData(entity: ClassSchema, refEntity: ClassSchema, extendedEntity: string, prop: 'properties' | 'staticProperties'): {[name: string]: Schema} {
    const res: {[name: string]: Schema & {inheritedFrom?: string}} = {};
    const paramsMap = refEntity.genericParams ? (refEntity.genericParams as Schema[]).map((param) => `#${extendedEntity}!${param.name}`) : [];
    const argsMap = entity.extends!.genericArguments || [];
    const refProperties = refEntity[prop];
    const properties = entity[prop];
    for (const p in properties) {
        if (properties.hasOwnProperty(p)) {
            res[p] = Object.assign({}, properties[p]);
        }
    }
    for (const p in refProperties) {
        if (refProperties.hasOwnProperty(p)) {
            if (!properties.hasOwnProperty(p)) {
                const property = refProperties[p];
                if (isRef(property)) {
                    const refType = property.$ref.startsWith(`#${extendedEntity}`) ? property.$ref : `#${extendedEntity}!${property.$ref.replace('#', '')}`;
                    const argIndex = paramsMap.indexOf(refType);
                    const o = Object.assign({inheritedFrom: `#${extendedEntity}`}, argsMap[argIndex]);
                    (res[p] as any) = o;
                } else {
                    const o = Object.assign({inheritedFrom: `#${extendedEntity}`}, refProperties[p]);
                    res[p] = o;
                }
            } else {
                res[p].inheritedFrom = `#${extendedEntity}`;
            }
        }
    }
    return res;
}

function linkObject(entity: Schema, entityType: string, refEntity: Schema & IObjectFields, paramsMap: Map<string, Schema>, schema: ModuleSchema): Schema {
    const res: typeof refEntity = {};
    res.type = refEntity.type;
    const refProperties = refEntity.properties;
    if (!refProperties) {
        return res;
    }
    const properties: {[name: string]: Schema} = {};
    for (const pArray in refProperties) {
        if (refProperties.hasOwnProperty(pArray)) {
            const property = refProperties[pArray];
            if (isRef(property)) {
                properties[pArray] = paramsMap.get(property.$ref)!;
            } else if (property.$allOf) {
                properties[pArray] = handleIntersection(property.$allOf, schema, paramsMap);
            } else {
                if (isSchemaOfType('object', property)) {
                    properties[pArray] = linkObject(entity, entityType, property, paramsMap, schema);
                }
            }
        }
    }
    res.properties = properties;
    return res;
}
