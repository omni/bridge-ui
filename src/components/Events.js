import React from 'react';
import { inject, observer } from "mobx-react";

const onClick = (e) => {
  console.log('sdfs');
}
const Event = ({eventName, transactionHash, recipient, value, blockNumber}) => {
  const color = eventName === 'Deposit' ? 'green' : 'red'
  return (
  <div className="events-i events-i_open">
    <div className="events-i-header">
      <div className="events-i-header-title">
        <p className={`label ${color}`}>{eventName}</p>
        <a href="#">Show Сouple</a>
      </div>
      <p className="description break-all">
        tx: {transactionHash}
      </p>
      <div onClick={onClick} className="events-i-switcher"></div>
    </div>
    <div className="events-i-body">
      <p className="label">Recepient</p>
      <p className="description break-all">
        {recipient}
      </p>
      <p className="label">Recepient value</p>
      <p className="description break-all">
        {value}
      </p>
      <p className="label">Block number</p>
      <p className="description">
        {blockNumber}
      </p>
    </div>
  </div>
)}
@inject("RootStore")
@observer
export class Events extends React.Component {
  constructor(props){
    super(props)
    this.homeStore = this.props.RootStore.homeStore;
  }
  render(){
    const deposits = [];
    this.homeStore.events.slice().forEach(({event, transactionHash, blockNumber, returnValues}, index) => {
      deposits.push(
        <Event
          eventName={event}
          transactionHash={transactionHash}
          blockNumber={blockNumber}
          recipient={returnValues.recipient}
          value={returnValues.value}
          key={index}/>)
    })
    return(
      <div className="events-container">
        <h1 className="events-title">Events</h1>
        <div className="events">
          <div className="events-side events-side_left">
            <h1 className="events-title events-title_mobile">Poa network</h1>
            <input type="text" className="events-side-input" placeholder="Block Number ..." />
            {deposits}
          </div>
          <div className="events-side events-side_right">
            <h1 className="events-title events-title_mobile">Ethereum network (kovan)</h1>
            <input type="text" className="events-side-input" placeholder="Block Number ..." />
            <div className="events-i">
              <div className="events-i-header">
                <div className="events-i-header-title">
                  <p className="label purple">Seigned for deposit</p>
                </div>
                <p className="description break-all">
                  tx: 0xdb6099042334280e83fa9e8e0bd3a5ed4ea9872dab7d26b04355e7722713fb86
                </p>
                <div className="events-i-switcher"></div>
              </div>
            </div>
            <div className="events-i">
              <div className="events-i-header">
                <div className="events-i-header-title">
                  <p className="label red">Withdraw</p>
                </div>
                <p className="description break-all">
                  tx: 0xdb6099042334280e83fa9e8e0bd3a5ed4ea9872dab7d26b04355e7722713fb86
                </p>
                <div className="events-i-switcher"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}