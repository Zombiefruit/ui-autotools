import * as React from 'react';

interface IState {
  count: string;
}

export class UnaccessibleButton extends React.Component<{}, IState> {

  public render() {
    return (
      <button>
        Unaccessible Click {this.state.count}
      </button>
    );
  }

}
