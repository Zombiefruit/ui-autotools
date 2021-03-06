import Registry, {getCompName} from '@ui-autotools/registry';
import React from 'react';
import ReactDOM from 'react-dom';

// [ISSUE] If the registry imported here and the registry imported by the
// project sit in different node_modules we're screwed.

// [ISSUE] @ui-autotools/registry doesn't export type for Registry.

// [ISSUE] simulations need to have titles, and .addSim() should check for
// uniquness of those titles because tests in Eyes are identified by their
// title.

const reactRoot = document.querySelector('#react-root')!;

function createTestsFromSimulations() {
  const tests = [];
  for (const [Comp, meta] of Registry.metadata.components.entries()) {
    for (const sim of meta.simulations) {
      tests.push({
        title: getCompName(Comp) + ' ' + sim.title,
        render:  () => ReactDOM.render(<Comp {...sim.props} />, reactRoot),
        cleanup: () => ReactDOM.unmountComponentAtNode(reactRoot)
      });
    }
  }
  return tests;
}

function run() {
  // Puppeteer decides which tests to run and in what order, we just provide it
  // with the list of test titles and expose hooks for render and cleanup.
  const tests = createTestsFromSimulations();
  (window as any).puppeteerRenderTest  = (i: number) => tests[i].render();
  (window as any).puppeteerCleanupTest = (i: number) => tests[i].cleanup();
  (window as any).puppeteerRunTests(tests.map(({title}) => ({title})));
}

run();
