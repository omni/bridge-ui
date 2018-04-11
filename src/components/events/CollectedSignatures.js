import React from 'react';

export default class CollectedSignatures extends React.Component{
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
    const { transactionHash, authorityResponsibleForRelay, blockNumber, messageHash, signedTxHash} = this.props;
    const color = 'blue'
    const open = this.state.show ? 'events-i_open' : ''
    let style
    if(this.state.show){
      style = {height: '21.5em'}
    }
    return (
    <div className={`events-i ${open}`}>
      <div className="events-i-header">
        <div className="events-i-header-title">
          <p className={`label ${color}`}>CollectedSignatures</p>
        </div>
        <p className="description break-all">
          tx: {transactionHash}
        </p>
      <div onClick={this.onClick} className="events-i-switcher"></div>
      </div>
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