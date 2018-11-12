/**
 * @jest-environment node
 */
import {renderToString} from 'react-dom/server';
import Registry, {getCompName} from '@ui-autotools/registry';
import {expect} from 'chai';
import memwatch from 'memwatch-next';

const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ssrTest = (): void => {
    describe('SSR tests', () => {
        it('should be run in an environment without document and window', () => {
            // TODO: check node context
            expect(() => window).to.throw();
            expect(() => document).to.throw();
        });

        Registry.metadata.components.forEach((componentMetadata, Comp) => {
            describe(getCompName(Comp), () => {
                componentMetadata.simulations.forEach(((simulation) => {
                    it(`should render component: "${getCompName(Comp)}" to string with props of simulation: "${simulation.title}" without throwing`, () => {
                        expect(() => renderToString(componentMetadata.simulationToJSX(simulation)), 'RenderToString threw an error').not.to.throw();
                    });

                    it('component should not have memory leaks', async () => {
                        // Take First Heap snapshot and trigger garbage collection
                        const heap = new memwatch.HeapDiff();

                        renderToString(componentMetadata.simulationToJSX(simulation));

                        await timeout(1000);

                        // Take second snapshot, trigger garbage collection and compute the diff
                        const end = heap.end();
                        console.log('end', end);
                        // const objectsThatRemainedInMemoryAfterGarbageCollection = _.map(end.change.details, 'what');

                        // const leakingObjectName = _.difference(objectsThatRemainedInMemoryAfterGarbageCollection, node_only_class_names);

                        // let assertion_message = '';
                        // if (leakingObjectName.length !== 0) {
                        //     assertion_message = `Somewhere in your code you created on object called ${leakingObjectName}. Unfortunately, you did not free ${leakingObjectName} and it is left memory after render and garbage collection. This will create a memory leak in server side rendering. Please make sure that ${leakingObjectName} is freed after a render. If you are not sure how please consult with server side rendering team.`;
                        // }
                        // expect(assertion_message).toEqual('');
                      });
                }));
            });
        });
    });
};
