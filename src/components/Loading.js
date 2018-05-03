import React from 'react';
import { inject, observer } from "mobx-react";
import loadingLogo from '../assets/images/logos/logo-loader.svg'

@inject("RootStore")
@observer
export class Loading extends React.Component {
  render() {
    const { alertStore } = this.props.RootStore
    const style = alertStore.showLoading ? {display: 'flex'} : {display: 'none'}
    return (
      <div className="loading-container" style={style}>
        <img className="loading" src={loadingLogo} alt="loading"/>
        <div className="loading-i" />
      </div>
    )
  }
}
