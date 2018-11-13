// import React from 'react';
// import ReactDOM from 'react-dom';
// import Registry, {getCompName} from '@ui-autotools/registry';
// import {hydrate} from 'react-dom';
// import memwatch from 'memwatch-next';

// export const memoryLeakTest = (): void => {
//   describe('Memory leak test', () => {
//     let index = 0;
//     const root = document.getElementById('root') as HTMLElement;
//     const componentStrings = (window as any).components;
//     const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

//     Registry.metadata.components.forEach((componentMetadata, Comp) => {
//       describe(getCompName(Comp), () => {
//         componentMetadata.simulations.forEach((simulation) => {
//           it('component should not have memory leaks', async () => {
//             // Take First Heap snapshot and trigger garbage collection
//             const heap = new memwatch.HeapDiff();

//             root.innerHTML = componentStrings[index];
//             hydrate(componentMetadata.simulationToJSX(simulation), root);
//             ReactDOM.unmountComponentAtNode(root);
//             index++;

//             await timeout(1000);

//             // Take second snapshot, trigger garbage collection and compute the diff
//             const end = heap.end();
//             console.log('end', end);
//             // const objectsThatRemainedInMemoryAfterGarbageCollection = _.map(end.change.details, 'what');

//             // const leakingObjectName = _.difference(objectsThatRemainedInMemoryAfterGarbageCollection, node_only_class_names);

//             // let assertion_message = '';
//             // if (leakingObjectName.length !== 0) {
//             //     assertion_message = `Somewhere in your code you created on object called ${leakingObjectName}. Unfortunately, you did not free ${leakingObjectName} and it is left memory after render and garbage collection. This will create a memory leak in server side rendering. Please make sure that ${leakingObjectName} is freed after a render. If you are not sure how please consult with server side rendering team.`;
//             // }
//             // expect(assertion_message).toEqual('');
//           });
//         });
//       });
//     });
//   });
// };
