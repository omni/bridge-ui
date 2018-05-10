import React from 'react';
import { inject, observer } from "mobx-react";
import loadingLogo from '../assets/images/logos/logo-loader.svg'
import { ProgressRing } from './ProgressRing'

@inject("RootStore")
@observer
export class Loading extends React.Component {
  render() {
    const { alertStore } = this.props.RootStore
    const { loadingStepIndex, loadingSteps, blockConfirmations } = alertStore
    const style = alertStore.showLoading ? {display: 'flex'} : {display: 'none'}
    const progress = loadingStepIndex === 3 ? 100 : (loadingStepIndex) * 25 + blockConfirmations * 4
    return (
      <div className={`loading-container ${loadingStepIndex > 0 ? 'mobile-container' : ''}`} style={style}>
        {loadingStepIndex > 0 && <ProgressRing
          radius={ 40 }
          stroke={ 4 }
          progress={progress}
          confirmationNumber={blockConfirmations}
        />}
        {loadingStepIndex === 0 && (<img className="loading" src={loadingLogo} alt="loading"/>)}
        {loadingStepIndex === 0 && <div className="loading-i" />}
        {loadingStepIndex > 0 && (<div className="loading-text">{loadingSteps[loadingStepIndex]}</div>)}
      </div>
    )
  }
}
