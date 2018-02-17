import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';

const FOREIGN_RPC_URL = 'https://kovan.infura.io/metamask';
const F_WSS = 'ws://localhost:8547';
const H_WS= 'ws://localhost:8111'
const HOME_RPC_URL = 'https://core.poa.network';
const kovan_foreign = new Web3.providers.WebsocketProvider(F_WSS);
// const sokol_home = new Web3.providers.HttpProvider(HOME_RPC_URL);
const sokol_home = new Web3.providers.WebsocketProvider(H_WS);

const web3_kovan_foreign = new Web3(kovan_foreign);
const web3_sokol_home = new Web3(sokol_home);

const foreignAbi = require('./foreignAbi');
const homeAbi = require('./homeAbi');
const HOME_BRIDGE_ADDRESS = '0x1aef87c8a7e1de8b1796b8d706cce25a9a947172';
const FOREIGN_BRIDGE_ADDRESS = '0xe60cf5001b3e360a279f4392169a0d039f71c195';

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
window.signatureToVRS = signatureToVRS;
const Row = ({params}) => {
  console.log(params);
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
    this.state = {
      homeEvents: [],
      foreignEvents: [],
      homeBridgeAddress: '',
      foreignBridgeAddress: '',
      homeBalance: '', 
      foreignBalance: ''
    }
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

      // this.setState({
      //   foreignBalance: web3_kovan_foreign.utils.fromWei(balance)
      // });
  }
  onSendHome(e) {
    e.preventDefault();
    const metamaskAcc = window.web3.eth.defaultAccount;
    foreignBridge.methods.balanceOf(metamaskAcc).call().then((balance) => {
      const data = foreignBridge.methods.transferHomeViaRelay(window.web3.eth.defaultAccount, new window.web3.BigNumber(balance)).encodeABI()
      console.log(data);
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
    homeBridge.getPastEvents({fromBlock: 1088894}, (e, homeEvents) => {
      // console.log(homeEvents);
      this.setState({
        homeEvents
      })
    })
    foreignBridge.getPastEvents({fromBlock: 5926862}).then((foreignEvents) => {
      console.log(foreignEvents);
      this.setState({
        foreignEvents
      })
    })
    foreignBridge.methods.totalSupply().call().then((balance) => {
      this.setState({
        foreignBalance: web3_kovan_foreign.utils.fromWei(balance)
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
        <button onClick={this.onSendHome}>Generate Signature to Home</button>
        <button onClick={this.onWithdrawal}>Withdraw from Home</button>
        <div className="row">
          <div className="col-md-6 events">
            <b>HomeBridge</b>
            <div>RPC URL: {HOME_RPC_URL}</div>
            <div>Home Address: {HOME_BRIDGE_ADDRESS}</div>
            <div>Balance: {this.state.homeBalance}</div>
            { this.state.homeEvents.map((params, index) => <Row params={ params } key={ index }/> ) }
          </div>
          <div className="col-md-6 events foreign">
            <b>ForeignBridge</b>
            <div>RPC URL: {FOREIGN_RPC_URL}</div>
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
