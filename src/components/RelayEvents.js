import React from 'react';
import { inject, observer } from "mobx-react";
import DepositWithdraw from './events/DepositWithdraw';
import SignedForDeposit from './events/SignedForDeposit';
import CollectedSignatures from './events/CollectedSignatures';

@inject("RootStore")
@observer
export class RelayEvents extends React.Component {
  constructor(props){
    super(props)
    this.homeStore = this.props.RootStore.homeStore;
    this.foreignStore = this.props.RootStore.foreignStore;
    this.web3Store = this.props.RootStore.web3Store;
    this.onHomeBlockFilter = this.onHomeBlockFilter.bind(this)
    this.onForeignBlockFilter = this.onForeignBlockFilter.bind(this)
  }
  onHomeBlockFilter(e){
    const blockNumber = e.target.value
    if(Number(blockNumber) > 0){
      this.homeStore.setBlockFilter(blockNumber)
    } else {
      this.homeStore.setBlockFilter(0)
    }
  }

  onForeignBlockFilter(e){
    const blockNumber = e.target.value
    if(Number(blockNumber) > 0){
      this.foreignStore.setBlockFilter(blockNumber)
    } else {
      this.foreignStore.setBlockFilter(0)
    }
  }
  render(){
    const home = [];
    this.homeStore.events.slice().forEach(({event, transactionHash, blockNumber, returnValues}, index) => {
      home.push(
        <DepositWithdraw
          eventName={event}
          transactionHash={transactionHash}
          blockNumber={blockNumber}
          recipient={returnValues.recipient}
          value={returnValues.value}
          homeTxHash={returnValues.transactionHash}
          filter={this.homeStore.filter || this.foreignStore.filter}
          key={index}/>)
    })
    const foreign = [];
    this.foreignStore.events.slice().forEach((e) => {
      // console.log(e)
    })
    this.foreignStore.events.slice().forEach(({
      event,
      transactionHash,
      signedTxHash,
      blockNumber,
      returnValues}, index) => {
      if(event === 'Deposit' || event === 'Withdraw'){
        const currency = event === 'Deposit' ? 'POA': this.foreignStore.symbol
        foreign.push(
          <DepositWithdraw
            eventName={event}
            transactionHash={transactionHash}
            blockNumber={blockNumber}
            recipient={returnValues.recipient}
            value={returnValues.value}
            homeTxHash={returnValues.transactionHash}
            filter={this.homeStore.filter || this.foreignStore.filter}
            currency={currency}
            key={index}/>)
      }
      if(event === "SignedForDeposit" || event === "SignedForWithdraw") {
        foreign.push(
          <SignedForDeposit eventName={event} blockNumber={blockNumber} message={returnValues.message} signer={returnValues.signer} key={index} transactionHash={transactionHash} filter={this.homeStore.filter || this.foreignStore.filter} signedTxHash={signedTxHash || returnValues.transactionHash}/>
        )
      }
      if( event === "CollectedSignatures"){
        foreign.push(
          <CollectedSignatures blockNumber={blockNumber} authorityResponsibleForRelay={returnValues.authorityResponsibleForRelay} messageHash={returnValues.messageHash} key={index} transactionHash={transactionHash} filter={this.homeStore.filter || this.foreignStore.filter} signedTxHash={signedTxHash || returnValues.transactionHash}/>
        )
      }
    })
    return(
      <div className="events-container">
        <h1 className="events-title">Events</h1>
        <div className="events">
          <div className="events-side events-side_left">
            <h1 className="events-title events-title_mobile">Home: {this.web3Store.homeNet.name}({this.web3Store.homeNet.id})</h1>
            <input type="text" onChange={this.onHomeBlockFilter} className="events-side-input" placeholder="Block Number ..." />
            {home}
          </div>
          <div className="events-side events-side_right">
            <h1 className="events-title events-title_mobile">Foreign: {this.web3Store.foreignNet.name}({this.web3Store.foreignNet.id})</h1>
            <input type="text" onChange={this.onForeignBlockFilter} className="events-side-input" placeholder="Block Number ..." />
            {foreign}
          </div>
        </div>
      </div>
    );
  }
}