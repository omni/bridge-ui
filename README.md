# POA Bridge - User Interface (UI) Application

[![Build Status](https://travis-ci.org/patitonar/bridge-ui.svg?branch=master)](https://travis-ci.org/patitonar/bridge-ui)
[![Gitter](https://badges.gitter.im/poanetwork/poa-bridge.svg)](https://gitter.im/poanetwork/poa-bridge?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


Welcome to the POA Bridge! Following is an overview of the POA Bridge and Bridge UI Application, as well as [basic instructions for getting started](#getting-started).


## POA Bridge Overview

The POA Bridge allows users to transfer assets between two chains in the Ethereum ecosystem. It is composed of several elements which are located in different POA Network repositories. 

For a complete picture of the POA Bridge functionality, it is useful to explore each repository.

**Bridge Elements**
1. Bridge UI Application. A DApp interface to transfer tokens and coins between chains, located in this repository.
2. [Bridge Smart Contracts](https://github.com/poanetwork/poa-bridge-contracts). Solidity contracts used to manage bridge validators, collect signatures, and confirm asset relay and disposal.
3. [Bridge Oracle](https://github.com/poanetwork/token-bridge). An oracle written in NodeJS.
4. [Bridge Monitor](https://github.com/poanetwork/bridge-monitor). A tool for checking balances and unprocessed events in bridged networks.
5. [Bridge Deployment Playbooks](https://github.com/poanetwork/deployment-bridge). Manages configuration instructions for remote deployments and allows you to deploy separate bridge instances for validators.
6. [Bridge Monitor](https://github.com/poanetwork/bridge-monitor).


## Bridge UI Application

The UI provides an intuitive interface for assets transfer between networks running the Bridge smart contracts. Users can connect to a web3 wallet such as [Nifty Wallet](https://chrome.google.com/webstore/detail/nifty-wallet/jbdaocneiiinmjbjlgalhcelgbejmnid?hl=en) or [MetaMask](https://metamask.io/) and complete the transfer through a web browser.

The current implementation allows for several bridge modes.

  1. `Native-to-ERC20` Coins on a Home network can be converted to ERC20-compatible tokens on a Foreign network. Coins are locked on the Home side and the corresponding amount of ERC20 tokens are minted on the Foreign side. When the operation is reversed, tokens are burnt on the Foreign side and unlocked in the Home network.
  2. `ERC20-to-ERC20` ERC20-compatible tokens on the Foreign network are locked and minted as ERC20-compatible tokens (ERC677 tokens) on the Home network. When transferred from Home to Foreign, they are burnt on the Home side and unlocked in the Foreign network. This can be considered a form of atomic swap when a user swaps the token "X" in network "A" to the token "Y" in network "B".


### UI Features
- Shows daily limits in both networks
- Displays all events in both networks
- Filter events from a specific block number on both sides of the bridge
- Find a corresponding event on different sides of the bridge
- Submit a transaction from Home to Foreign network
- Submit a transaction from Foreign to Home network

### User Transactions
- Connect to the network you want to transfer coins from using a web3 wallet such as Nifty Wallet or MetaMask. This can be the Home or Foreign network. The wallet must be funded to include amount to transfer and any gas costs.
- Specify the amount to send.
- Click the Transfer button.
- Confirm the transaction via the web3 wallet. 
- The same address is used to send a coin from the Home network and receive a token on the Foreign Network.

### Resources
Resources that describe various versions of the bridge. Some may be outdated, but will give a general sense of the UI and transactional flow.

- [Deployed URL for POA -> Ethereum Network Bridge](https://bridge.poa.net/)
- [Testnet Bridge URL](https://bridge-testnet.poa.net/)
- [Bridge UI Tutorial Videos](https://www.youtube.com/playlist?list=PLS5SEs8ZftgUqR3hVFiEXQLqE9QI8sIGz)
- [Article on the POA Bridge](https://medium.com/poa-network/cross-chain-bridges-paving-the-way-to-internet-of-blockchains-422ac94bc2e5)


## Getting Started

The following is an example setup using the POA Sokol testnet as the Home network, and the Ethereum Kovan testnet as the Foreign network. The instructions for the Bridge UI are identical for an `ERC20-to-ERC20` configuration, but the smart contract deployment steps will vary.

### Dependencies

- [poa-bridge-contracts](https://github.com/poanetwork/poa-bridge-contracts)
- [token-bridge](https://github.com/poanetwork/token-bridge)
- [node.js](https://nodejs.org/en/download/)
- [Nifty Wallet](https://chrome.google.com/webstore/detail/nifty-wallet/jbdaocneiiinmjbjlgalhcelgbejmnid?hl=en) or [MetaMask](https://metamask.io/)

### Setup

1. Create an empty folder where you will be setting up your bridge. In this example we call it `sokol-kovan-bridge`.
`mkdir sokol-kovan-bridge && cd sokol-kovan-bridge`  

2. Prepare temporary ETH address(es) for deployment. Each validator will require an address. 
  * Generate a new Ethereum keystore file JSON and its password.
    * Got to https://www.myetherwallet.com.
    * Enter a password and click `Create New Wallet`.
    * Download the keystore file.

3. Create a new account in Nifty Wallet or MetaMask and import the JSON keystore file. See the wallet resources if you need more information on this step.  

4. Fund the test account(s).
  * Fund Home accounts (`Validators`) using the [POA Sokol Faucet](https://faucet-sokol.herokuapp.com/)
  * Get free Kovan Coins from the [gitter channel](https://gitter.im/kovan-testnet/faucet) or [Iracus faucet](https://github.com/kovan-testnet/faucet) for Foreign Accounts. Get 5 Keth to 1 acc, and transfer from it to all other wallets.


5. Deploy the Sokol <-> Kovan Bridge contracts.
  * Go to the the `sokol-kovan-bridge` folder created in step 1 and `git clone https://github.com/poanetwork/poa-bridge-contracts`
  * Follow instructions in the [POA Bridge contracts repo](https://github.com/poanetwork/poa-bridge-contracts).
  * Set the parameters in the .env file.
    * DEPLOYMENT_ACCOUNT_PRIVATE_KEY: Private key from step 2
    * HOME_RPC_URL=https://sokol.poa.network
    * HOME_OWNER_MULTISIG: Wallet address(es) of validators. For testing, you can use the same address for all address values in the file. 
    * FOREIGN_RPC_URL=https://kovan.infura.io/mew


5. Install and run the POA Bridge Oracle.
  * Got to the `sokol-kovan-bridge` folder and  `git clone https://github.com/poanetwork/token-bridge`
  * Follow instructions in the [POA NodeJS Oracle repo](https://github.com/poanetwork/token-bridge).


If successful, you will see bridge processes run when you issue a command. For example run `npm run watcher:signature-request`

**Example Output:**
```bash
[1539195000507] INFO (watcher-signature-request): Connected to redis
[1539195000545] INFO (watcher-signature-request): Connected to amqp Broker
[1539195006085] INFO (watcher-signature-request): Found 0 UserRequestForSignature events
[1539195011467] INFO (watcher-signature-request): Found 0 UserRequestForSignature events
```

6. Keep the bridge processes running. Open a separate terminal window and go to the `sokol-kovan-bridge` folder to install and unpack this repository.

  *  `git clone https://github.com/poanetwork/bridge-ui.git`  
  * `cd bridge-ui`  
  * `npm install`  
  * Create a .env file from the example file[.env.example](.env.example)  
`cp .env.example .env`  
  * Insert addresses from the bridgeDeploymentResults.json file into the .env file.
`cat ../poa-bridge-contracts/deploy/bridgeDeploymentResults.json`  

```bash
# HomeBridge address in bridgeDeploymentResults.json
REACT_APP_HOME_BRIDGE_ADDRESS=0x.. 
#ForeignBridge address in bridgeDeploymentResults.json
REACT_APP_FOREIGN_BRIDGE_ADDRESS=0x..
#https public RPC node for Foreign network
REACT_APP_FOREIGN_HTTP_PARITY_URL=https://kovan.infura.io/mew
#public RPC node for Home network 
REACT_APP_HOME_HTTP_PARITY_URL=https://sokol.poa.network 
#// Gas price speed option (slow, standard, fast, instant)
REACT_APP_GAS_PRICE_SPEED_TYPE=fast
```

  * Run `npm run start`
  * Make sure you have a web3 wallet installed (Nifty Wallet or MetaMask) and connected to the POA Sokol Network. Check that you are connected the funded account from step 2 in the web3 wallet
  * Specify an amount and click Transfer to make a cross chain transaction from Sokol to Kovan

## Testing

`npm run test`

To run tests with coverage

`npm run coverage`

## Contributing

See the [CONTRIBUTING](CONTRIBUTING.md) document for contribution, testing and pull request protocol.

## License

[![License: LGPL v3.0](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)

This project is licensed under the GNU Lesser General Public License v3.0. See the [LICENSE](LICENSE) file for details.
