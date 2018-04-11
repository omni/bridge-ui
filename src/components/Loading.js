import React from 'react';
import { inject, observer } from "mobx-react";

@inject("RootStore")
@observer
export class Loading extends React.Component {
  constructor(props){
    super(props)
    this.errorsStore = props.RootStore.errorsStore;
  }
  render() {
    const style = this.errorsStore.showLoading ? {display: 'block'} : {display: 'none'}
    return (
      <div className="loading-container" style={style}>
        <div className="loading">
          <div className="loading-i"></div>
          <div className="loading-i"></div>
          <div className="loading-i"></div>
          <div className="loading-i"></div>
          <div className="loading-i"></div>
          <div className="loading-i"></div>
        </div>
      </div>
    )
  }
}