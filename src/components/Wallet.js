import React from 'react';
import { inject, observer } from "mobx-react";
import walletIcon from '../assets/images/icons/icon-wallet.svg'
import { getAddressUrl } from '../stores/utils/web3'


@inject("RootStore")
@observer
export class Wallet extends React.Component {
  render() {
    const { web3Store, homeStore, foreignStore, alertStore } = this.props.RootStore
    const isHome = web3Store.metamaskNet.id.toString() === web3Store.homeNet.id.toString()
    const explorerPath = getAddressUrl(web3Store.metamaskNet.id)
    const completed = isHome ? homeStore.getDailyQuotaCompleted() : foreignStore.getDailyQuotaCompleted()
    const width = `${completed}%`

    const wallet = web3Store.defaultAccount.address !== '' && web3Store.defaultAccount.address !== undefined
      ? (<a
          href={explorerPath+web3Store.defaultAccount.address}
          target="_blank"
          className="wallet-text wallet-link">
        {web3Store.defaultAccount.address.slice(0,17).concat('...')}
      </a>)
      :  (<span className="wallet-text">Login with <span className="wallet-text-metamask">Metamask</span></span>)

    return (
      <div className="header-wallet"
        onMouseEnter={() => alertStore.setShowDailyQuotaInfo(true)}
        onMouseLeave={() => alertStore.setShowDailyQuotaInfo(false)}
      >
        <div className="wallet-container">
          <img className="wallet-icon" src={walletIcon} alt=""/>
          {wallet}
        </div>
        <div className="daily-quota-container">
          {web3Store.metamaskNet.id && <div className="daily-quota-progress" style={{width}} />}
        </div>
      </div>
    )
  }
}
