import React from 'react';
import { inject, observer } from "mobx-react";
import DepositWithdraw from './events/DepositWithdraw';

@inject("RootStore")
@observer
export class Events extends React.Component {
  constructor(props){
    super(props)
    this.homeStore = this.props.RootStore.homeStore;
    this.foreignStore = this.props.RootStore.foreignStore;
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
          key={index}/>)
    })
    const foreign = [];
    this.foreignStore.events.slice().forEach(({event, transactionHash, blockNumber, returnValues}, index) => {
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
            currency={currency}
            key={index}/>)
      }
    })
    return(
      <div className="events-container">
        <h1 className="events-title">Events</h1>
        <div className="events">
          <div className="events-side events-side_left">
            <h1 className="events-title events-title_mobile">Poa network</h1>
            <input type="text" className="events-side-input" placeholder="Block Number ..." />
            {home}
          </div>
          <div className="events-side events-side_right">
            <h1 className="events-title events-title_mobile">Ethereum network (kovan)</h1>
            <input type="text" className="events-side-input" placeholder="Block Number ..." />
            {foreign}
          </div>
        </div>
      </div>
    );
  }
}