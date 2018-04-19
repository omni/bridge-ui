import React from 'react';
import { inject, observer } from "mobx-react";

@inject("RootStore")
@observer
export class Loading extends React.Component {
  render() {
    const { alertStore } = this.props.RootStore
    const style = alertStore.showLoading ? {display: 'block'} : {display: 'none'}
    return (
      <div className="loading-container" style={style}>
        <div className="loading">
          <div className="loading-i" />
          <div className="loading-i" />
          <div className="loading-i" />
          <div className="loading-i" />
          <div className="loading-i" />
          <div className="loading-i" />
        </div>
      </div>
    )
  }
}
