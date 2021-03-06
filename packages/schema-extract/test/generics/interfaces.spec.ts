import {expect} from 'chai';
import { ModuleSchema, FunctionSchemaId, interfaceId } from '../../src/json-schema-types';
import {transformTest} from '../../test-kit/run-transform';

describe('schema-extract - generic interface', () => {
    it('should support genric interface definition', async () => {
        const moduleId = 'interface-definition';
        const res = await transformTest(`
        export interface MyInterface<T> {
            something:T;
        };
        export let param:MyInterface<string>;
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                MyInterface : {
                    $ref: interfaceId,
                    genericParams: [{
                        name: 'T',
                    }],
                    properties: {
                        something: {
                            $ref: '#MyInterface!T',
                        },
                    },
                    required: ['something']
                },
            },
            properties: {
                param: {
                    $ref: '#MyInterface',
                    genericArguments: [{
                        type: 'string',
                    }],
                },
            },
        };
        expect(res).to.eql(expected);
    });

    it('should support generic arguments schema', async () => {
        const moduleId = 'interface-definition';
        const res = await transformTest(`
        export interface MyInterface<T extends string>{
            something:T;
        };
        export let param:MyInterface<'gaga'>;
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                MyInterface : {
                    $ref: interfaceId,
                    genericParams: [{
                        name: 'T',
                        type: 'string',
                    }],
                    properties: {
                        something: {
                            $ref: '#MyInterface!T',
                        },
                    },
                    required: ['something']
                },
            },
            properties: {
                param: {
                    $ref: '#MyInterface',
                    genericArguments: [{
                        type: 'string',
                        enum: [
                            'gaga',
                        ],
                    }],
                },
            },
        };
        expect(res).to.eql(expected);
    });

    it('generic arguments should be passed deeply', async () => {
        const moduleId = 'interface-definition';
        const res = await transformTest(`
        export interface MyInterface<T extends string>{
            something:{
                deepKey:T
            };
            method:(arg:{
                values:T[],
                filter:(item:T)=>boolean
            })=>{
                status:string,
                results:T[]
            }
        };
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                MyInterface : {
                    $ref: interfaceId,
                    genericParams: [{
                        name: 'T',
                        type: 'string',
                    }],
                    properties: {
                        something: {
                            type: 'object',
                            properties: {
                                deepKey: {
                                    $ref: '#MyInterface!T',
                                },
                            },
                            required: ['deepKey']
                        },
                        method: {
                            $ref: FunctionSchemaId,
                            arguments: [
                                {
                                    name: 'arg',
                                    type: 'object',
                                    properties: {
                                        values: {
                                            type: 'array',
                                            items: {
                                                $ref: '#MyInterface!T'
                                            }
                                        },
                                        filter: {
                                            $ref: FunctionSchemaId,
                                            arguments: [
                                                {
                                                    name: 'item',
                                                    $ref: '#MyInterface!T'
                                                }
                                            ],
                                            requiredArguments: ['item'],
                                            returns: {
                                                type: 'boolean'
                                            }
                                        }
                                    },
                                    required: ['values', 'filter']
                                }
                            ],
                            requiredArguments: ['arg'],
                            returns: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                    },
                                    results: {
                                        type: 'array',
                                        items: {
                                            $ref: '#MyInterface!T'
                                        }
                                    }
                                },
                                required: ['status', 'results']
                            }
                        }
                    },
                    required: ['something', 'method']
                }
            },
            properties: {}
        };
        expect(res).to.eql(expected);
    });

    it('should support generic imports', async () => {
        const moduleId = 'interface-definition';
        const res = await transformTest(`
        import * as Event from 'event';

        export interface MyInterface {
            func: (event: Event<A>) => void;
        };
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                MyInterface : {
                    $ref: interfaceId,
                    properties: {
                        func: {
                            $ref: 'common/function',
                            arguments: [
                                {
                                    $ref: 'event',
                                    genericArguments: [
                                        {
                                            $ref: '#A'
                                        }
                                    ],
                                    name: 'event'
                                }
                            ],
                            requiredArguments: ['event'],
                            returns: {
                                $ref: 'common/undefined'
                            },
                        }
                    },
                    required: ['func']
                }
            },
            properties: {}
        };
        expect(res).to.eql(expected);
    });

    it('should support extending genric interfaces', async () => {
        const moduleId = 'interface-definition';
        const res = await transformTest(`
        export interface TypeA<T> {
            something:T;
        };
        export interface TypeB extends TypeA<string> {
            somethingElse: number
        };
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                TypeA : {
                    $ref: interfaceId,
                    genericParams: [{
                        name: 'T',
                    }],
                    properties: {
                        something: {
                            $ref: '#TypeA!T',
                        },
                    },
                    required: ['something']
                },
                TypeB : {
                    $ref: interfaceId,
                    genericArguments: [{
                        type: 'string'
                    }],
                    extends: {
                        $ref: '#TypeA'
                    },
                    properties: {
                        somethingElse: {
                            type: 'number'
                        },
                    },
                    required: ['somethingElse']
                },
            },
            properties: {},
        };
        expect(res).to.eql(expected);
    });
});
