import * as React from 'react';
import style from './inaccessible-input.st.css';

export class InaccessibleInput extends React.Component {
  public static displayName = 'InaccessibleInput';

  public componentWillMount() {
    return null;
  }

  public render() {
    return <input {...style('root', {}, this.props)}>bllalalalal</input>;
  }
}
