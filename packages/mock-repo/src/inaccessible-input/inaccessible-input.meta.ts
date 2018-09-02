import Registry from '@ui-autotools/registry';
import {InaccessibleInput} from './inaccessible-input';

const meta = Registry.getComponentMetadata(InaccessibleInput);

meta.addSim({
  title: 'InaccessibleInput',
  props: {}
});

meta.reactStrictModeCompliant = false;
