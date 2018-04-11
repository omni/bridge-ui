import React from 'react';

export default class SignedForDeposit extends React.Component{
  constructor(props) {
    super(props)
    this.onClick  = this.onClick.bind(this)
    this.state = {
      show: props.filter
    }
  }
  onClick(e) {
    this.setState({show: !this.state.show});
  }
  render(){
    let { blockNumber, message, signer, transactionHash, eventName, signedTxHash, filter } = this.props;
    const color = 'purple'
    const open = this.state.show ? 'events-i_open' : ''
    let style, homeTxInfo
    if(this.state.show){
      style = {height: '21.5em'}
    }
    return (
    <div className={`events-i ${open}`}>
      <div className="events-i-header">
        <div className="events-i-header-title">
          <p className={`label ${color}`}>{eventName}</p>
        </div>
        <p className="description break-all">
          tx: {transactionHash}
        </p>
      <div onClick={this.onClick} className="events-i-switcher"></div>
      </div>
        <div className="events-i-body" style={style}>
          <p className="label">Message</p>
          <p className="description break-all">
            {message}
          </p>
          <p className="label">Signer</p>
          <p className="description break-all">
            {signer}
          </p>
          <p className="label">Block number</p>
          <p className="description">
            {blockNumber}
          </p>
          <p className="label">Signed Tx Hash</p>
          <p className="description">
            {signedTxHash}
          </p>
        </div>
    </div>
    )}
  }