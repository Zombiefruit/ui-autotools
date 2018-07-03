/* tslint:disable */
import React from 'react';
import ReactDOM from 'react-dom';
import Registry from 'metadata-tools';
import axe from 'axe-core';

(window as any).axeImpat = 'minor';

function createTestsFromSimulations(reactRoot: any) {
  const tests = [];
  for (const [Comp, meta] of Registry.metadata.components.entries()) {
    for (const [simIndex, sim] of meta.simulations.entries()) {
      tests.push({
        title: Comp.name + ' ' + simIndex,
        render:  (container: any) => ReactDOM.render(<div id={Comp.name}><Comp {...sim.props} /></div>, container),
        cleanup: () => ReactDOM.unmountComponentAtNode(reactRoot)
      });
    }
  }
  return tests;
}

const root = document.getElementById('root');
async function test(rootElement: HTMLElement) {
  const comps = createTestsFromSimulations(root);
  for (const c of comps) {
    const div = document.createElement('div');
    rootElement.appendChild(div);
    await c.render(div);
  }
  axe.run(rootElement, (err: Error, result: axe.AxeResults) => {
    if (err) throw err;
    (window as any).runAxeTest(result);
  });
}

test(root!);
