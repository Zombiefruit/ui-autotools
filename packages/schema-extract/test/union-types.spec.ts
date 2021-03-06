import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform';

describe('schema-extract - union', () => {
    it('should support union types', async () => {
        const moduleId = 'unions';
        const res = await transformTest(`
        import {AType} from './test-assets'

        export let declared_union : string | number;

        export let infered_union = Math.random()>0.5 ? 5 : "gaga";

        export let specific_union : Specific_union;

        export let type_union : AType | number;

        export type Specific_union = 'hello' | 'goodbye' | number;
        export let union_union: Specific_union | 'goodday';

        export let inline_union: number | {
            value:number
        }

        export type strings = 'a' | 'b' | 'c';
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                Specific_union: {
                    $oneOf: [
                        {
                            type: 'number',
                        },
                        {
                            type: 'string',
                            enum: ['hello', 'goodbye'],
                        },
                    ],
                },
                strings: {
                    type: 'string',
                    enum: [
                        'a', 'b', 'c'
                    ]
                },
            },
            properties: {
                declared_union: {
                    $oneOf: [
                        {
                            type: 'string',
                        },
                        {
                            type: 'number',
                        },
                    ],
                },
                infered_union: {
                    $oneOf: [
                        {
                            type: 'string',
                        },
                        {
                            type: 'number',
                        },
                    ],
                    initializer: 'Math.random()>0.5 ? 5 : "gaga"'
                },
                specific_union: {
                    $ref: '#Specific_union',
                },
                type_union: {
                    $oneOf: [
                        {
                            $ref: '/src/test-assets#AType',
                        },
                        {
                            type: 'number',
                        },
                    ],

                },
                union_union: {
                    $oneOf: [
                        {
                            $ref: '#Specific_union',
                        },
                        {
                            type: 'string',
                            enum: ['goodday'],
                        },
                    ],
                },
                inline_union: {
                    $oneOf: [
                        {
                            type: 'number',
                        },
                        {
                            type: 'object',
                            properties: {
                                value: {
                                    type: 'number',
                                },
                            },
                            required: ['value']
                        },
                    ],
                }
            },
        };
        expect(res).to.eql(expected);
    });

});
