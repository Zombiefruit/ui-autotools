import * as React from 'react';
import Registry, {ComponentMetadata} from '../src/registry';
import {expect} from 'chai';

interface TestProps {
  text: string;
}

const TestComp: React.SFC<TestProps> = (props: TestProps) => {
  return <h1>Hey {props.text} person</h1>;
};

const testSim = {
  props: {
    text: 'person'
  }
};

describe('Registry', () => {
  beforeEach(() => {
    Registry.clean();
  });

  it('returns an already existing metadata', () => {
    const myCompMetaData = Registry.describe(TestComp);
    const mySecondCompMetaData = Registry.describe(TestComp);

    expect(mySecondCompMetaData).to.equal(myCompMetaData);
  });

  describe('The Describe method', () => {
    it('adds a new component\'s metadata to the registry, and returns its meta data', () => {
      const myCompMetaData = Registry.describe(TestComp);
      expect(myCompMetaData).to.be.an.instanceof(ComponentMetadata);
    });
  });

  describe('The addSim method', () => {
    it('adds a new simulation to the component metadata', () => {
      const myCompMetaData = Registry.describe(TestComp);
      myCompMetaData.addSim(testSim);
      expect(myCompMetaData.simulations[0]).to.equal(testSim);
    });
  });

  describe('The clean method', () => {
    it('removes any existing metadata', () => {
      Registry.describe(TestComp);
      expect(Registry.metadata.size).to.equal(1);

      Registry.clean();

      expect(Registry.metadata.size).to.equal(0);
    });
  });
});