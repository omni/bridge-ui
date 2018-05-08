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
                gasValue={454600}
                users={10280}
                totalBridged={275.15}
                homeBalance={homeStore.balance}
                foreignSupply={foreignStore.totalSupply} />
          </div>
          <div className='statistics-transaction-container'>
            <div className='statistics-deposit-container'>
              <span className='statistics-deposit-title statistics-title'>Home Deposits</span>
              <TransactionsStatistics
                txNumber={152}
                value={28.825} />
            </div>
            <div className='statistics-withdraw-container'>
              <span className='statistics-withdraw-title statistics-title'>Home Withdraws</span>
              <TransactionsStatistics
                txNumber={87}
                value={18.892} />
            </div>
          </div>
          <div className='statistics-chart-container'>
            <span className='statistics-chart-title statistics-title'>Foreign Total Supply</span>
          </div>
        </div>
        <div className='statistics-right-container'>
          <img className='statistics-right-image' src={pattern} alt=""/>
        </div>
      </div>
    )
  }
}
