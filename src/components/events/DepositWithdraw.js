import React from 'react';
import Web3Utils from 'web3-utils'
import { inject, observer } from "mobx-react";

@inject("RootStore")
@observer
export default class Event extends React.Component{
  constructor(props) {
    super(props)
    this.onReveal  = this.onReveal.bind(this)
    this.state = {
      show: props.filter
    }
  }
  onReveal(e) {
    this.setState({show: !this.state.show});
  }
  render(){
    let {home, eventName, transactionHash, recipient, value, blockNumber, homeTxHash, currency, filter} = this.props;
    value = Web3Utils.fromWei(value)
    const color = eventName === 'Deposit' ? 'green' : 'red'
    const open = this.state.show ? 'events-i_open' : ''
    const filterTxt = filter ? 'Reset filter' : 'Find Relayed Events'
    const labelOtherTxHash = home ? "Home" : "Foreign"
    let homeTxInfo, style, filterComponent;
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
      <div className="events-i-header">
        <div className="events-i-header-title">
          <p className={`label ${color}`}>{eventName}</p>
        </div>
        <p className="description break-all">
          tx: {transactionHash}
        </p>
      <div onClick={this.onReveal} className="events-i-switcher"></div>
      </div>
        <div className="events-i-body" style={style}>
          <p className="label">Recepient</p>
          <p className="description break-all">
            {recipient}
          </p>
          <p className="label">Recepient value</p>
          <p className="description break-all">
            {value} {currency}
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