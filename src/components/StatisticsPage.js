import React from 'react'
import { inject, observer } from "mobx-react"
import pattern from '../assets/images/pattern.svg'
import { BridgeStatistics } from './index'
import { TransactionsStatistics } from './TransactionsStatistics'

@inject("RootStore")
@observer
export class StatisticsPage extends React.Component {

  render(){
    const { homeStore, foreignStore } = this.props.RootStore
    return(
      <div className="statistics-page">
        <div className='statistics-left-container' />
        <div className='statistics-page-container'>
          <div className='statistics-bridge-container'>
            <span className='statistics-bridge-title statistics-title'>Bridge Statistics</span>
              <BridgeStatistics
                users={homeStore.statistics.finished ? homeStore.statistics.users.size : ''}
                totalBridged={homeStore.statistics.finished ? homeStore.statistics.totalBridged.toString() : ''}
                homeBalance={homeStore.balance}
                homeSymbol={homeStore.symbol}
                homeNativeSupplyTitle={true}
                foreignSymbol={foreignStore.symbol}
                foreignSupply={foreignStore.totalSupply} />
          </div>
          <div className='statistics-transaction-container'>
            <div className='statistics-deposit-container'>
              <span className='statistics-deposit-title statistics-title'>Tokens Deposits</span>
              <TransactionsStatistics
                txNumber={homeStore.statistics.finished ? homeStore.statistics.deposits : ''}
                type={foreignStore.symbol}
                value={homeStore.statistics.finished ? homeStore.statistics.depositsValue : ''} />
            </div>
            <div className='statistics-withdraw-container'>
              <span className='statistics-withdraw-title statistics-title'>Tokens Withdraws</span>
              <TransactionsStatistics
                txNumber={homeStore.statistics.finished ? homeStore.statistics.withdraws : ''}
                type={foreignStore.symbol}
                value={homeStore.statistics.finished ? homeStore.statistics.withdrawsValue : ''} />
            </div>
          </div>
        </div>
        <div className='statistics-right-container'>
          <img className='statistics-right-image' src={pattern} alt=""/>
        </div>
      </div>
    )
  }
}
