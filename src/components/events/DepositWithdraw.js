import React from 'react';
import Web3Utils from 'web3-utils'
import { inject, observer } from "mobx-react";

@inject("RootStore")
@observer
export default class Event extends React.Component{
  constructor(props) {
    super(props)
    this.onReveal  = this.onReveal.bind(this)
    this.onFindRelayedEvents = this.onFindRelayedEvents.bind(this)
    this.state = {
      show: props.filter
    }
  }
  onReveal(e) {
    this.setState({show: !this.state.show});
  }
  onFindRelayedEvents(e){
    e.preventDefault()
    if(!this.props.filter){
      if(this.props.eventName === 'Deposit'){
        if(this.props.homeTxHash){
          this.props.RootStore.foreignStore.filterByTxHashInReturnValues(this.props.homeTxHash)
          this.props.RootStore.homeStore.filterByTxHash(this.props.homeTxHash)
        } else {
          this.props.RootStore.foreignStore.filterByTxHashInReturnValues(this.props.transactionHash)
          this.props.RootStore.homeStore.filterByTxHash(this.props.transactionHash)
        }
      }

      if(this.props.eventName === 'Withdraw'){
        if(this.props.homeTxHash){
          this.props.RootStore.foreignStore.filterByTxHash(this.props.homeTxHash)
          this.props.RootStore.homeStore.filterByTxHashInReturnValues(this.props.homeTxHash)
        } else {
          this.props.RootStore.foreignStore.filterByTxHash(this.props.transactionHash)
          this.props.RootStore.homeStore.filterByTxHashInReturnValues(this.props.transactionHash)
        }
      }
    }
    
    this.props.RootStore.homeStore.toggleFilter()
    this.props.RootStore.foreignStore.toggleFilter()
  }
  render(){
    let {eventName, transactionHash, recipient, value, blockNumber, homeTxHash, currency, filter} = this.props;
    value = Web3Utils.fromWei(value)
    const color = eventName === 'Deposit' ? 'green' : 'red'
    const open = filter || this.state.show ? 'events-i_open' : ''
    const filterTxt = filter ? 'Reset filter' : 'Find Relayed Events'
    let homeTxInfo, style;
    if(homeTxHash && this.state.show){
      homeTxInfo = (
        <div>
          <p className="label">Home Tx Hash</p>
          <p className="description">
            {homeTxHash}
          </p>
        </div>
      )
      style = {height: '19.5em'}
    }
    const filterBtn = eventName === 'Deposit' ? <button onClick={this.onFindRelayedEvents}>{filterTxt}</button> : null
    return (
    <div name="myScrollToElement" className={`events-i ${open}`}>
      <div className="events-i-header">
        <div className="events-i-header-title">
          <p className={`label ${color}`}>{eventName}</p>
          <button onClick={this.onFindRelayedEvents}>{filterTxt}</button>
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