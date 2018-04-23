import React from 'react';
import { EventHeader } from './EventHeader'

export default class CollectedSignatures extends React.Component{
  constructor(props) {
    super(props)
    this.onClick  = this.onClick.bind(this)
    this.state = {
      show: props.filter
    }
  }
  onClick() {
    this.setState({show: !this.state.show});
  }
  render(){
    const { eventName, transactionHash, authorityResponsibleForRelay, blockNumber, messageHash, signedTxHash} = this.props;
    const color = 'blue'
    const open = this.state.show ? 'events-i_open' : ''
    let style
    if(this.state.show){
      style = {height: '21.5em'}
    }
    return (
    <div className={`events-i ${open}`}>
      <EventHeader
        color={color}
        eventName={eventName}
        transactionHash={transactionHash}
        handleClick={this.onClick}
      />
      <div className="events-i-body" style={style}>
        <p className="label">Authority Responsible For Relay</p>
        <p className="description break-all">
          {authorityResponsibleForRelay}
        </p>
        <p className="label">Signed Tx Hash</p>
        <p className="description break-all">
          {signedTxHash}
        </p>
        <p className="label">Message Hash</p>
        <p className="description break-all">
          {messageHash}
        </p>
        <p className="label">Block number</p>
        <p className="description">
          {blockNumber}
        </p>
      </div>
    </div>
    )}
  }
