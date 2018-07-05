import React from 'react';
import ReactDOM from 'react-dom';
import Registry from 'metadata-tools';
import axe from 'axe-core';

interface ITest {
  title: string;
  render: (container: HTMLElement) => void;
  cleanup: () => void;
}

export interface ITests {
  comp: string;
  result?: axe.AxeResults;
  error?: Error;
}

function createTestsFromSimulations(reactRoot: any) {
  const tests: ITest[] = [];
  for (const [Comp, meta] of Registry.metadata.components.entries()) {
    for (const [simIndex, sim] of meta.simulations.entries()) {
      tests.push({
        title: (Comp.displayName ? Comp.displayName : Comp.name) + ' ' + simIndex,
        render:  (container: HTMLElement) => ReactDOM.render(<div id={Comp.name}><Comp {...sim.props} /></div>, container),
        cleanup: () => ReactDOM.unmountComponentAtNode(reactRoot)
      });
    }
  }
  return tests;
}

const root = document.getElementById('react-root');
async function test(rootElement: HTMLElement) {
  const results: ITests[] = [];
  const comps = createTestsFromSimulations(root);
  for (const c of comps) {
    try {
      await c.render(rootElement);
      const result = await axe.run(rootElement);
      results.push({comp: c.title, result});
      await c.cleanup();
    } catch (error) {
      results.push({comp: c.title, error});
    }
  }
  (window as any).puppeteerReportResults(results);
}

test(root!);
