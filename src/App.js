import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';

const FOREGIGN_WEB_SOCKETS_PARITY_URL =process.env.REACT_APP_FOREGIGN_WEB_SOCKETS_PARITY_URL
const HOME_WEB_SOCKETS_PARITY_URL=process.env.REACT_APP_HOME_WEB_SOCKETS_PARITY_URL
const kovan_foreign = new Web3.providers.WebsocketProvider(FOREGIGN_WEB_SOCKETS_PARITY_URL);
const sokol_home = new Web3.providers.WebsocketProvider(HOME_WEB_SOCKETS_PARITY_URL);

const web3_kovan_foreign = new Web3(kovan_foreign);
const web3_sokol_home = new Web3(sokol_home);

const foreignAbi = require('./foreignAbi');
const homeAbi = require('./homeAbi');
const erc677Abi = require('./erc677Abi');

const HOME_BRIDGE_ADDRESS = process.env.REACT_APP_HOME_BRIDGE_ADDRESS;
const FOREIGN_BRIDGE_ADDRESS = process.env.REACT_APP_FOREIGN_BRIDGE_ADDRESS;

const homeBridge = new web3_sokol_home.eth.Contract(homeAbi, HOME_BRIDGE_ADDRESS);
const foreignBridge = new web3_kovan_foreign.eth.Contract(foreignAbi, FOREIGN_BRIDGE_ADDRESS);
function strip0x(input) {
  return input.replace(/^0x/, "");
}

function signatureToVRS(signature) {
  if(signature.length === 2 + 32 * 2 + 32 * 2 + 2){
    signature = strip0x(signature);
    var v = parseInt(signature.substr(64 * 2), 16);
    var r = "0x" + signature.substr(0, 32 * 2);
    var s = "0x" + signature.substr(32 * 2, 32 * 2);
    return {v: v, r: r, s: s};
  }
}
const Row = ({params}) => {
  let log;
  if(params.event === "CollectedSignatures"){
    log = (
      <div id={params.id} className="collapse">
        <div className="Rtable-cell">authorityResponsibleForRelay: {params.returnValues.authorityResponsibleForRelay}</div>
        <div className="Rtable-cell">messageHash: {params.returnValues.messageHash}</div>
      </div>
    ) 
  } else {
    log = (
    <div id={params.id} className="collapse">
        <div className="Rtable-cell">Recipient: {params.returnValues.recipient || params.returnValues.to}</div>
        <div className="Rtable-cell">Recipient value: {params.returnValues.value || params.returnValues.tokens}</div>
        <div className="Rtable-cell">Block Number: {params.blockNumber}</div>
      </div>
    )
  }
  return (
    <div>
      <div data-toggle="collapse" data-target={`#${params.id}`} >Event: {params.event} tx: {params.transactionHash}</div>
      {log}
    </div>
  )
}
class App extends Component {
  constructor(props){
    super(props)
    this.onSendHome = this.onSendHome.bind(this)
    this.onWithdrawal = this.onWithdrawal.bind(this)
    this.sendTokensToHome = this.sendTokensToHome.bind(this)
    this.state = {
      homeEvents: [],
      foreignEvents: [],
      homeBridgeAddress: '',
      foreignBridgeAddress: '',
      homeBalance: '', 
      foreignBalance: '',
      tokenAddress: ''
    }
  }
  async sendTokensToHome(e){
    e.preventDefault()
    let tokenAmount = this.refs.withdraw.value;
    tokenAmount = web3_kovan_foreign.utils.toWei(tokenAmount.toString().trim());
    const token = new web3_kovan_foreign.eth.Contract(erc677Abi, this.state.tokenAddress);
    let web3_metamask = new Web3(window.web3.currentProvider);
    const data = token.methods.transferAndCall(FOREIGN_BRIDGE_ADDRESS, tokenAmount, "0x").encodeABI()
    web3_metamask.eth.sendTransaction({
      from: window.web3.eth.defaultAccount,
      to: this.state.tokenAddress,
      data: data
    }, (e,a) => {
      console.log(e,a)
    })
    
    // let web3_metamask = new Web3(window.web3.currentProvider);

  }
  async onWithdrawal(e) {
    e.preventDefault();
    const metamaskAcc = window.web3.eth.defaultAccount;
    const msgHash = this.refs.withdraw.value;
    let signature = await foreignBridge.methods.signature(msgHash,0).call()
    const vrs = signatureToVRS(signature)
    const msg = await foreignBridge.methods.message(msgHash).call();
    const data = homeBridge.methods.withdraw([vrs.v], [vrs.r], [vrs.s], msg).encodeABI()

    let web3_metamask = new Web3(window.web3.currentProvider);
    web3_metamask.eth.sendTransaction({
      from: metamaskAcc,
      to: HOME_BRIDGE_ADDRESS,
      data: data
    }, (e,a) => {
      console.log(e,a)
    })

  }
  onSendHome(e) {
    e.preventDefault();
    const metamaskAcc = window.web3.eth.defaultAccount;
    foreignBridge.methods.balanceOf(metamaskAcc).call().then((balance) => {
      const oneGwei = web3_kovan_foreign.utils.toWei('1', 'gwei');
      const data = foreignBridge.methods.transferHomeViaRelay(window.web3.eth.defaultAccount, new window.web3.BigNumber(balance), oneGwei).encodeABI()
      let web3_metamask = new Web3(window.web3.currentProvider);
      web3_metamask.eth.sendTransaction({
        from: metamaskAcc,
        to: FOREIGN_BRIDGE_ADDRESS,
        data: data
      }, (e,a) => {
        console.log(e,a)
      })
    })
  }
  getEvents(){
    homeBridge.getPastEvents({fromBlock: 0}, (e, homeEvents) => {
      this.setState({
        homeEvents
      })
    })
    foreignBridge.getPastEvents({fromBlock: 0}).then((foreignEvents) => {
      this.setState({
        foreignEvents
      })
    })
    foreignBridge.methods.erc677token().call().then(async (erc677tokenAddress) => {
      console.log('tokenAddress', erc677tokenAddress)
      const token = new web3_kovan_foreign.eth.Contract(erc677Abi, erc677tokenAddress);
      const totalSupply = await token.methods.totalSupply().call()
      this.setState({
        tokenAddress: erc677tokenAddress,
        foreignBalance: web3_kovan_foreign.utils.fromWei(totalSupply)
      });
    })
    web3_sokol_home.eth.getBalance(HOME_BRIDGE_ADDRESS).then((balance) => {
      this.setState({
        homeBalance: web3_kovan_foreign.utils.fromWei(balance)
      });
    })
  }
  componentDidMount(){
    this.getEvents()
    homeBridge.events.allEvents({
      fromBlock: 0
    }).on('data', (e) => {
      this.getEvents()
    })
    
    foreignBridge.events.allEvents({
      fromBlock: 0
    }).on('data', (e) => {
      this.getEvents()
    })
  }
  render() {
    // console.log('this.props', this.state)

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Scalable Ethereum</h1>
        </header>
        <input ref="withdraw" type="text"/>
        {/* <button onClick={this.onSendHome}>Generate Signature to Home</button>
        <button onClick={this.onWithdrawal}>Withdraw from Home</button> */}
        <button onClick={this.sendTokensToHome}>Send Tokens To Home</button>
        <div className="row">
          <div className="col-md-6 events">
            <b>POA Network</b>
            <div>RPC URL: {HOME_WEB_SOCKETS_PARITY_URL}</div>
            <div>Home Address: {HOME_BRIDGE_ADDRESS}</div>
            <div>Balance: {this.state.homeBalance}</div>
            { this.state.homeEvents.map((params, index) => <Row params={ params } key={ index }/> ) }
          </div>
          <div className="col-md-6 events foreign">
            <b>Ethereum Network (Kovan)</b>
            <div>RPC URL: {FOREGIGN_WEB_SOCKETS_PARITY_URL}</div>
            <div>Foreign Address: {FOREIGN_BRIDGE_ADDRESS}</div>
            <div>Balance: {this.state.foreignBalance}</div>
            { this.state.foreignEvents.map((params, index) => <Row params={ params } key={ index }/> ) }
          </div>
          
        </div>
      </div>
    );
  }
}

export default App;
