import React from 'react'
import { inject, observer } from "mobx-react"
import numeral from 'numeral'


@inject("RootStore")
@observer
export class DailyQuotaModal extends React.Component {
  state = {
    left: 0,
    top: 0
  }

  componentDidMount() {
    this.getPosition()
  }

  getPosition = () => {
    const offsetsElement = document.getElementsByClassName('header-wallet')
    if(offsetsElement.length > 0) {
      const offsets =  offsetsElement[0].getBoundingClientRect();
      const height = offsets.height;
      const left = offsets.left;
      this.setState({left, top: height + 20})
    } else {
      setTimeout(this.getPosition, 100)
    }
  }

  render() {
    const { web3Store, homeStore, foreignStore } = this.props.RootStore
    const { left, top } = this.state

    const isHome = web3Store.metamaskNet.id.toString() === web3Store.homeNet.id.toString()
    const value = isHome ? homeStore.maxCurrentDeposit : foreignStore.maxCurrentDeposit
    const from = isHome ? 'POA' : 'POA20'
    const to = isHome ? 'POA20' : 'POA'
    const networkFrom = isHome ? 'POA' : 'ETH'
    const networkTo = isHome ? 'ETH' : 'POA'
    const networkNameFrom = isHome ? web3Store.homeNet.name : web3Store.foreignNet.name
    const networkNameTo = isHome ? web3Store.foreignNet.name : web3Store.homeNet.name

    return (
      <div className="daily-quota-modal-container">
        <div className="daily-quota-modal" style={{left, top}}>
          <div className='modal-container'>
            <span className="daily-quota-title">Daily Quota</span>
            <span className="daily-quota-description">
              {numeral(value).format('0,0.0', Math.floor)} {from} on {networkFrom} {networkNameFrom + ' '}
              remaining for transfer to {to + ' '}
              on {networkTo} {networkNameTo}
            </span>
          </div>
        </div>
      </div>
    )
  }
}
