import React from 'react';
import {ISchemaViewProps} from '../../schema-view';
import style from './type.st.css';

export const BooleanTypeView: React.FunctionComponent<ISchemaViewProps> = (props) => (
  <div {...style('root', {category: 'boolean'}, props)}>boolean</div>
);
