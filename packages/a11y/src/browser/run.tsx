import React from 'react';
import ReactDOM from 'react-dom';
import Registry, {getCompName} from '@ui-autotools/registry';
import axe from 'axe-core';

interface ITest {
  title: string;
  render: (container: HTMLElement) => void;
  cleanup: () => void;
}

export interface IResult {
  comp: string;
  result?: axe.AxeResults;
  error?: Error;
}

function createTestsFromSimulations(reactRoot: HTMLElement) {
  const tests: ITest[] = [];
  for (const [Comp, meta] of Registry.metadata.components.entries()) {
    if (!meta.nonA11yCompliant) {
      for (const sim of meta.simulations) {
        tests.push({
          title: getCompName(Comp) + ' ' + sim.title,
          render:  (container: HTMLElement) => ReactDOM.render(<Comp {...sim.props} />, container),
          cleanup: () => ReactDOM.unmountComponentAtNode(reactRoot)
        });
      }
    }
  }
  return tests;
}

async function test(rootElement: HTMLElement) {
  const results: IResult[] = [];
  const tests = createTestsFromSimulations(rootElement);
  for (const t of tests) {
    try {
      await t.render(rootElement);
      const result = await axe.run(rootElement);
      results.push({comp: t.title, result});
      await t.cleanup();
    } catch (error) {
      results.push({comp: t.title, error});
    }
  }
  (window as any).puppeteerReportResults(results);
}

test(document.getElementById('react-root')!);
