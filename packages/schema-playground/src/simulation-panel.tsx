import { Schema, isSchemaOfType } from '@ui-autotools/schema-extract/esm/json-schema-types';
import React from 'react';
import { RepositoryProvider, AutoView, AutoViewProps } from 'auto-views-core';
import { editRepo } from 'auto-views-repositories';

export const userEditRepo = editRepo.clone('userEditRepo', (node: any) => {
    if (node.type) {
        return node.type;
    }
    if (node.ts_type) {
        return node.ts_type;
    }
    return 'common/unknown';
});

userEditRepo.addWrapper(
    (item, props) => {
        return (
        <div>
            <label>{props.schema.title || (props as any).field}:</label>
            {item}
        </div>);
    }
);

userEditRepo.register('common/unknown', {
    name: 'unknown',
    component: (props: AutoViewProps) =>
        <span style={{color: 'red'}}>unknown</span>
});

userEditRepo.register('common/any', {
    name: 'any',
    component: (props: AutoViewProps) =>
        <span style={{color: 'red'}}>any</span>
});
export function sanitize(schema: Schema, availableDefs: string[]): Schema {
    if (!schema.type) {
        if (schema.$ref && availableDefs.includes(schema.$ref.slice(1))) {
            return schema;
        }
        if (schema.$ref && schema.$ref.startsWith('common/')) {
            const newSchema = {...schema, ts_type: schema.$ref};
            delete newSchema.$ref;
            if (schema.$ref === 'common/interface') {
                newSchema.type = 'object';
            }
            return sanitize(newSchema, availableDefs);
        }
        return {

        } as any;
    }
    if (isSchemaOfType('object', schema)) {
        const properties: {[name: string]: Schema} = {};
        if (schema.properties && Object.keys(schema.properties).length) {
            Object.keys(schema.properties!).forEach((propName) => {
                properties[propName] = sanitize(schema.properties![propName], availableDefs);
            });
        } else {
            return {
            } as any;
        }
        return {
            type: 'object',
            properties
        };
    }
    if (isSchemaOfType('array', schema)) {
        return {
            type: 'array',
            items: sanitize(schema.items || {}, availableDefs)
        };
    }
    return schema;
}

export type ISchemaWithId = Schema & {
    $id: string
};
export class SimulationPanel extends React.Component<{
    schemaRegistry: Map<string, Schema>;
    rootSchema: string
}> {
    public render() {
        const definitionsArr: ISchemaWithId[] = [];
        const availableDefs =  Array.from(this.props.schemaRegistry.keys());
        this.props.schemaRegistry.forEach((value, key) => definitionsArr.push({
            ...sanitize(value, availableDefs),
            $id: '#' + key
        }));
        const rootSchema: ISchemaWithId = definitionsArr.find((schema) => '#' + this.props.rootSchema === schema.$id) || (sanitize({}, []) as any);
        return (
                <RepositoryProvider components={userEditRepo} schemas={definitionsArr}>
                    <AutoView
                        schema={rootSchema}
                    />
                </RepositoryProvider>);
    }
}
