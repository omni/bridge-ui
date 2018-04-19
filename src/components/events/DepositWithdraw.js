import React from 'react';
import Web3Utils from 'web3-utils'
import { EventHeader } from './EventHeader'

export default class DepositWithdraw extends React.Component{
  constructor(props) {
    super(props)
    this.onReveal  = this.onReveal.bind(this)
    this.state = {
      show: props.filter
    }
  }
  onReveal() {
    this.setState({show: !this.state.show});
  }
  render(){
    const {home, eventName, transactionHash, recipient, value, blockNumber, homeTxHash, currency} = this.props;
    const formattedValue = Web3Utils.fromWei(value)
    const color = eventName === 'Deposit' ? 'green' : 'red'
    const open = this.state.show ? 'events-i_open' : ''
    const labelOtherTxHash = home ? "Home" : "Foreign"
    let homeTxInfo, style
    if(homeTxHash && this.state.show){
      homeTxInfo = (
        <div>
          <p className="label">{labelOtherTxHash} Tx Hash</p>
          <p className="description">
            {homeTxHash}
          </p>
        </div>
      )
      style = {height: '19.5em'}
    }
    return (
    <div name="myScrollToElement" className={`events-i ${open}`}>
      <EventHeader
        color={color}
        eventName={eventName}
        transactionHash={transactionHash}
        handleClick={this.onReveal}
      />
      <div className="events-i-body" style={style}>
        <p className="label">Recepient</p>
        <p className="description break-all">
          {recipient}
        </p>
        <p className="label">Recepient value</p>
        <p className="description break-all">
          {formattedValue} {currency}
        </p>
        <p className="label">Block number</p>
        <p className="description">
          {blockNumber}
        </p>
        {homeTxInfo}
      </div>
    </div>
    )}
  }
