import React from 'react'
import { inject, observer } from "mobx-react"
import { Configuration } from './Configuration'
import { Authority } from './Authority'

@inject("RootStore")
@observer
export class StatusPage extends React.Component {

  render() {
    const { homeStore } = this.props.RootStore
    return (
      <div className="status-page">
        <div className='status-left-container' />
        <div className='status-page-container'>
          <div className='status-configuration-container'>
            <span className='status-configuration-title status-title'>Configuration</span>
              <Configuration
                requiredSignatures={homeStore.requiredSignatures}
                authorities={homeStore.validators.length}
                estGasCost={0}
                maxSingleDeposit={homeStore.maxPerTx}
                maxTotalBalance={homeStore.maxCurrentDeposit} />
          </div>
          <div className='status-authorities-container'>
            <span className='status-authorities-title status-title'>Authorities</span>
            <div className='status-authorities-data'>
              {homeStore.validators.map((validator,i) => (
                <Authority key={validator} address={validator} number={(i+1)} logo={(i+1) % 4} />
              ))}
            </div>
          </div>
        </div>
        <div className='status-right-container' />
      </div>
    )
  }
}
