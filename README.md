[![Build Status](https://travis-ci.org/patitonar/bridge-ui.svg?branch=master)](https://travis-ci.org/patitonar/bridge-ui)
[![Coverage Status](https://coveralls.io/repos/github/patitonar/bridge-ui/badge.svg?branch=master)](https://coveralls.io/github/patitonar/bridge-ui?branch=master)
[![dependencies Status](https://david-dm.org/poanetwork/bridge-ui/status.svg)](https://david-dm.org/poanetwork/bridge-ui)

![Demo](demo.gif)
### Deployed URL

https://poanetwork.github.io/bridge-ui/#/

### Related repositories 
Name | Description
--------- | ------- 
POA Bridge Binary | https://github.com/poanetwork/poa-bridge 
POA Bridge UI | https://github.com/poanetwork/bridge-ui
POA Bridge Smart Contracts | https://github.com/poanetwork/poa-bridge-contracts
POA Bridge Monitoring service | https://github.com/poanetwork/bridge-monitor
POA Bridge Deployment scripts | https://github.com/poanetwork/deployment-bridge

## POA Bridge UI app
A Cross-chain bridge provides interoperability between any Ethereum-compatible network such as Ethereum Foundation, Ethereum Classic, Ubiq, Expanse, POA Network, Rootstock, and many others.<br/>
This Bridge-UI is an app which runs on multiple computers with two contracts on both sides of the bridge. As an example, on the left side of the bridge is POA Network. The app listens to events from the Home Bridge contract. On the right side of the bridge is Ethereum Foundation. In congruence with the communicating smart contracts and the Bridge-UI Dapp, ERC20 tokens are created corresponding to these events mapped 1:1.<br/>
The contract on the right side of the bridge accepts transactions signed by authorities of the POA consensus. A subset of validators on POA Network runs the bridge software. If you trust authorities of the POA Network, then you inherit this trust into the bridge, i.e. the assets are transferred in a trustless manner.<br/>
[Read more](https://medium.com/poa-network/cross-chain-bridges-paving-the-way-to-internet-of-blockchains-422ac94bc2e5)


Using the current implementation of Bridges-UI, a user can tokenize their native coin of an EVM (Ethereum Virtual Machine) network into ERC20 representation token on another EVM compatible network. 
Security considerations:
In order to provide better decentralization of the bridges, a user can increase the number of required signatures and expand the number of validators. To increase security, block confirmations should be increased to protect against double spending attacks.
POA smart contracts allows maintainers of the bridges to 
- Upgrade smart contracts by fixing potential security vulnerabilities in a smart contract with multisig contract
- Add validators
- Remove validators
- Set required number of signatures from validators
- Set daily limit of deposits on Home Network(left side) for native coin deposits(POA)
- Set daily limit of withdrawals on Foreign Network(right side) for ERC20/ERC677 token transfers(POA20)
- Set max limit per transaction for deposits on Home Network(left side) for native coin deposits(POA)
- Set min amount per transaction for deposits on Home Network(left side) for native coin deposits(POA)
- Set max limit per transaction for deposits on Foreign Network(right side) for ERC20/ERC677 token transfers(POA20)
- Set min amount per transaction for deposits on Foreign Network(right side) for ERC20/ERC677 token transfers(POA20)
- Storing Home Deposits in Home Bridge contract
- Minting on Deposits of ERC20 compatible token on Foreign Network by validators
- Burning on Withdrawals of ERC20 compatible token on Foreign Network by validators

Bridge UI  features:
- Show daily limits in both networks
- Display all events in both networks
- Filter events from specific block number on both sides
- Find corresponding event on different sides of the network
- Submit a transaction from Home to Foreign network
- Submit a transaction from Foreign to Home network

## Bridge UI
Bridge UI allows users to explore all cross chain transactions that are happening. Users can submit a transaction on both sides of the networks. 

#### From Home to Foreign Network transaction:
To tokenize native POA coins a user must complete the following:
- Specify the amount
- Click the arrow -> send button
- Confirm transaction via MetaMask
- The address that you use to send from, the same address will be used to receive the token on a Foreign chain
The amount sent must be within the daily limits provided by the contracts. When the transaction is validated, the user should see the Deposit event on the Home Network (left side - POA Network). After some time, Validators submit signatures emitting SignedForDeposit event to the Foreign Network. Once the required number of signatures is reached, a Deposit event is emitted on the Foreign Network. Hence, an equivalent amount of ERC20 tokens are minted on the Foreign Network with the corresponding depost address. 

#### From Foreign to Home Network transaction:
To burn and send back to Home Network (ERC20 to POA20):
- Specify an Amount
- Click the switch button and click the <- arrow button to send
- Confirm transaction on MetaMask
- The address that you use to send from, the same address will be used to receive the coin on a Home chain

The amount sent must be within the daily limits provided by the contracts. When the transaction is validated, the user should expect to see a Withdrawal Event on the Foreign Network (right-side - Ethereum Foundation). After some time, Validators submit signatures emitting SignedForWithdrawal event to the Foreign Network. Once the required number of signatures is reached, CollectedSignatures event is emitted on the Foreign Network. The ERC20 tokens are burned on the Foreign Network. This process generates a signed message which Validators submit on the Home Network. The user automatically receives their Native POA Coin.

# Storage of funds
When you send POA on Home Network(POA.network), it gets stored and locked into a smart contract on POA.network.
When you send POA20 on Foreign Network (Ethereum Mainnet), it is automatically burnt and reduced from totalSupply, therefore it's not stored anywhere right after a sender initiated a transfer to Home network. Once the transfer is relayed, locked funds on Home network are withdrawn to the sender automatically.

# Responsibilities and roles of the bridge:
- Administrator Role(representation of a multisig contract):
  - add/remove validators
  - set daily limits on both bridges
  - set maximum per transaction limit on both bridges
  - set minimum required signatures from validators in order to relay a user's transaction
- Super Administrator for Validator Contract (representation of a multisig contract):
  - upgrade contracts in case of vulnerability
- Super Administrator for Bridge Contract (representation of a multisig contract):
  - upgrade contracts in case of vulnerability
- Validator Role :
  - provide 100% uptime to relay transactions
  - listen for Deposit events on Home bridge to mint erc20 token on Foreign bridge
  - listen for Withdraw events on Foreign bridge to unlock funds on Home Bridge
- User role:
  - sends POA coins to Home bridge in order to receive ERC20 token on Foreign Bridge using the same address to send/receive
  - sends ERC20 POA20 token on Foreign Bridge in order to receive POA coins on Home Bridge using the same address to send/receive

## Dependencies

- [poa-bridge-contracts](https://github.com/poanetwork/poa-bridge-contracts/tree/0.1)
- [node.js](https://nodejs.org/en/download/)
- [metamask](https://metamask.io/)
- happy mood and patience

## Preparation for using the UI App
1. Create empty folder where you will be setting up your bridge. In the following example lets call it `sokol-kovan-bridge`  
`mkdir sokol-kovan-bridge && cd sokol-kovan-bridge`  

### 2. Deploy Sokol <-> Kovan Bridge contracts:  
Prepare temporary eth address for deployment
```
DEPLOYMENT_ACCOUNT_ADDRESS=0x08660156928d768D26D3eeF642c11527FDca0891
DEPLOYMENT_ACCOUNT_PRIVATE_KEY=67..14
```

  * For the following addresses, you can reuse same address, but for production deployment it's highly recommended to use different, preferrably multisig wallets in order to split control of responsibilities. For simplicity, I'm going to use same address for all 6 following values:
```
HOME_OWNER_MULTISIG=0x08660156928d768D26D3eeF642c11527FDca0891
HOME_UPGRADEABLE_ADMIN_VALIDATORS=0x08660156928d768D26D3eeF642c11527FDca0891
HOME_UPGRADEABLE_ADMIN_BRIDGE=0x08660156928d768D26D3eeF642c11527FDca0891
FOREIGN_OWNER_MULTISIG=0x08660156928d768D26D3eeF642c11527FDca0891
FOREIGN_UPGRADEABLE_ADMIN_VALIDATORS=0x08660156928d768D26D3eeF642c11527FDca0891
FOREIGN_UPGRADEABLE_ADMIN_BRIDGE=0x08660156928d768D26D3eeF642c11527FDca0891
```
  * `VALIDATORS` : Generate New Ethereum Keystore File JSON and its password https://www.myetherwallet.com/#generate-wallet
  * Fund Home accounts(`Validators`) using Sokol Faucet URL:
  https://faucet-sokol.herokuapp.com/ 
  * Get free Kovan Coins from the [gitter channel](https://gitter.im/kovan-testnet/faucet) or [Iracus faucet](https://github.com/kovan-testnet/faucet) to Foreign Accounts. Get 5 Keth to 1 acc, and transfer from it to all others.
  * `git clone --branch 0.1 https://github.com/poanetwork/poa-bridge-contracts.git`
  * Make sure that you have a fresh installation of Node.js (version > 8)
   If not, you can update your main installation or use https://github.com/creationix/nvm 
  * `cd poa-bridge-contracts && npm install`
  * `npm run compile`
  * `cd ./deploy && npm install`
  * `cp .env.example .env`
  * `nano .env`
```rust
DEPLOYMENT_ACCOUNT_ADDRESS=0xb8988b690910913c97a090c3a6f80fad8b3a4683
DEPLOYMENT_ACCOUNT_PRIVATE_KEY=67..14
DEPLOYMENT_GAS_LIMIT=4000000
DEPLOYMENT_GAS_PRICE=10
GET_RECEIPT_INTERVAL_IN_MILLISECONDS=3000

HOME_RPC_URL=https://sokol.poa.network
HOME_OWNER_MULTISIG=0xdd2BcC1e053aBB1DfA6c1F3D6C7842f57d61440F
HOME_UPGRADEABLE_ADMIN_VALIDATORS=0xdd2BcC1e053aBB1DfA6c1F3D6C7842f57d61440F
HOME_UPGRADEABLE_ADMIN_BRIDGE=0xdd2BcC1e053aBB1DfA6c1F3D6C7842f57d61440F
HOME_DAILY_LIMIT=1000000000000000000
HOME_MAX_AMOUNT_PER_TX=100000000000000000
HOME_MIN_AMOUNT_PER_TX=10000000000000000
HOME_REQUIRED_BLOCK_CONFIRMATIONS=1
HOME_GAS_PRICE=1

FOREIGN_RPC_URL=https://kovan.infura.io/mew
FOREIGN_OWNER_MULTISIG=0xb8988b690910913c97a090c3a6f80fad8b3a4683
FOREIGN_UPGRADEABLE_ADMIN_VALIDATORS=0xb8988b690910913c97a090c3a6f80fad8b3a4683
FOREIGN_UPGRADEABLE_ADMIN_BRIDGE=0xb8988b690910913c97a090c3a6f80fad8b3a4683
FOREIGN_DAILY_LIMIT=1000000000000000000
FOREIGN_MAX_AMOUNT_PER_TX=100000000000000000
FOREIGN_MIN_AMOUNT_PER_TX=10000000000000000
FOREIGN_REQUIRED_BLOCK_CONFIRMATIONS=8
FOREIGN_GAS_PRICE=10

REQUIRED_NUMBER_OF_VALIDATORS=1
VALIDATORS="0xb506698581484572b6ccfbd6c976f0948775eace"
```

#### Explanation of parameters:

Name | Description
--------- | -------
DEPLOYMENT_ACCOUNT_ADDRESS | Temporary  account from which all contracts will be deployed.Make sure that the deployment account owns some ether on both kovan & sokol network.
DEPLOYMENT_ACCOUNT_PRIVATE_KEY | private key from temp account
DEPLOYMENT_GAS_LIMIT | Gas Limit to use for transactions during bridge contract provisioning 
DEPLOYMENT_GAS_PRICE | Gas Price to use for transactions during bridge contract provisioning on both networks in gwei  
GET_RECEIPT_INTERVAL_IN_MILLISECONDS | Interval that is used to wait for tx to be mined( 3 sec in example)
HOME_RPC_URL | Public RPC Node URL for Home Network  
HOME_OWNER_MULTISIG | Address of Administrator role on Home network to change parameters of the bridge and validator's contract
HOME_UPGRADEABLE_ADMIN_VALIDATORS | Address from which Validator's contract could be upgraded
HOME_UPGRADEABLE_ADMIN_BRIDGE | Address from which HomeBridge's contract could be upgraded
HOME_DAILY_LIMIT | Daily Limit in Wei. Example above is `1 eth`  
HOME_MAX_AMOUNT_PER_TX | Max limit per 1 tx in Wei. Example above is `0.1 eth`  
HOME_MIN_AMOUNT_PER_TX | Minimum amount per 1 tx in Wei. Example above is `0.01 eth`  
HOME_REQUIRED_BLOCK_CONFIRMATIONS | Number of blocks issued after the block with the corresponding deposit transaction to make sure that the transaction will not be rolled back
HOME_GAS_PRICE | Gas Price to use for transactions to relay withdraws to Home Network
FOREIGN_RPC_URL | Public RPC Node URL for Foreign Network  
FOREIGN_OWNER_MULTISIG | Address of Administrator role on FOREIGN network to change parameters of the bridge and validator's contract
FOREIGN_UPGRADEABLE_ADMIN_VALIDATORS | Address from which Validator's contract could be upgraded
FOREIGN_UPGRADEABLE_ADMIN_BRIDGE | Address from which HomeBridge's contract could be upgraded
FOREIGN_DAILY_LIMIT | Daily Limit in Wei. Example above is `1 eth`  
FOREIGN_MAX_AMOUNT_PER_TX | Max limit per 1 tx in Wei. Example above is `0.1 eth`  
FOREIGN_MIN_AMOUNT_PER_TX | Minimum amount per 1 tx in Wei. Example above is `0.01 eth`  
FOREIGN_REQUIRED_BLOCK_CONFIRMATIONS | Number of blocks issued after the block with the corresponding withdraw transaction to make sure that the transaction will not be rolled back
FOREIGN_GAS_PRICE | Gas Price to use for transactions to deposit and confirm withdraws to Foreign Network
VALIDATORS | array of validators on Home and Foreign network. Space separated.  
REQUIRED_NUMBER_OF_VALIDATORS | Minimum Number of validators in order to Withdraw Funds on POA network Sokol  

3. run `node deploy.js`  

As a result you should have the following output:  
```bash
[   Home  ] HomeBridge:  0xE460DD303Abf282Bde9f7c9cB608D1E1a7c02E0a
[ Foreign ] ForeignBridge:  0x902a15b45a3cD1A8aC5ab97c69C8215FC26763eA
[ Foreign ] POA20:  0xAb121C134aD7e128BE06fEaf40b494F9865F794b
Contracts Deployment have been saved to `bridgeDeploymentResults.json`
```
DESTROY `.env` file  
`rm -rf .env`  
The deployment information is also located in `bridgeDeploymentResults.json`  
When you are done, go back to `sokol-kovan-bridge` folder   
`cd ../../`

## 5. Install poa-bridge binary

* Install `rust` and `cargo`: [installation instructions.](https://www.rust-lang.org/en-US/install.html)

* Install `solc` and add it to `$PATH`: [installation instructions.](https://solidity.readthedocs.io/en/develop/installing-solidity.html)

* `git clone https://github.com/poanetwork/poa-bridge.git`
* `cd poa-bridge`
* Run:

```
make
```
7. Go back to directory up.
`cd ..`
8. Create `config.toml` file  
`nano config.toml`  
Replace
`0xETH_ACCOUNT_VALIDATOR_SOKOL` to your `HOME_VALIDATORS` address   
`0xETH_ACCOUNT_VALIDATOR_KOVAN` to your `FOREIGN_VALIDATORS` address  
and `authorities` to your `VALIDATORS` from .env deploy.js above

```yaml
keystore = "keys"

[home]
account = "0xETH_ACCOUNT_VALIDATOR_SOKOL"
required_confirmations = 0
rpc_host = "https://sokol.poa.network"
rpc_port = 443
password = "password.txt"

[foreign]
account = "0xETH_ACCOUNT_VALIDATOR_KOVAN"
required_confirmations = 0
rpc_host = "https://kovan.infura.io/mew"
rpc_port = 443
password = "password.txt"

[authorities]
accounts = [
  "0x..",
  "0x.."
]
required_signatures = 1

[transactions]
deposit_relay = { gas = 3000000, gas_price = 1000000000 }
withdraw_relay = { gas = 3000000, gas_price = 1000000000 }
withdraw_confirm = { gas = 3000000, gas_price = 1000000000 }
```
9. Create db.toml file  
`nano db.toml`  
Insert addresses from  
`cat poa-bridge-contracts/deploy/bridgeDeploymentResults.json`  
```yaml
home_contract_address = "0xE46...E0a" #YOUR HOME CONTRACT ADDRESS THAT YOU DEPLOYED IN STEP#3 
foreign_contract_address = "0x90...3eA" #YOUR FOREIGN CONTRACT ADDRESS THAT YOU DEPLOYED IN STEP#4
checked_deposit_relay = 1400663 # last checked deposits events on Home network
checked_withdraw_relay = 6342830 # last checked withdraw events on Foreign network
checked_withdraw_confirm = 6342830 # last checked withdraw events on Foreign network
```
Exit `nano` by Ctrl-O and Ctrl-X  

* mkdir `keys`
* put validator JSON keystore into `keys` folder
* create `password.txt` file and insert your password for the key

10. At this step your folder structure should look like this
```bash
.
└── sokol-kovan-bridge
    ├── config.toml
    ├── db.toml
    ├── poa-bridge
    └── poa-bridge-contracts
```
11. Run the bridge app:
```
env RUST_LOG=info ./poa-bridge/target/release/bridge --config config.toml --database db.toml
```

If everything went well, you should see some logs from the  bridge:
```bash
INFO:bridge: Parsing cli arguments
INFO:bridge: Loading config
INFO:bridge: Starting event loop
INFO:bridge: Home rpc host https://sokol.poa.network
INFO:bridge: Establishing connection:
INFO:bridge:   using RPC connection
INFO:bridge: Acquiring home & foreign chain ids
INFO:bridge: Home chain ID: 77 Foreign chain ID: 42
INFO:bridge: Loaded database
INFO:bridge: Starting listening to events
INFO:bridge::bridge: Retrieved home contract balance
INFO:bridge::bridge: Retrieved foreign contract balance
INFO:bridge::bridge::deposit_relay: got 0 new deposits to relay
INFO:bridge::bridge::deposit_relay: relaying 0 deposits
INFO:bridge::bridge::deposit_relay: deposit relay completed
INFO:bridge::bridge::withdraw_relay: got 0 new signed withdraws to relay
INFO:bridge::bridge::withdraw_relay: fetching messages and signatures
INFO:bridge::bridge::withdraw_relay: fetching messages and signatures complete
INFO:bridge::bridge::withdraw_relay: relaying 0 withdraws
INFO:bridge::bridge::withdraw_relay: relaying withdraws complete
INFO:bridge::bridge::withdraw_relay: waiting for signed withdraws to relay
INFO:bridge::bridge::withdraw_confirm: got 0 new withdraws to sign
```
Open separate terminal window and go to your `sokol-kovan-bridge` folder

12. Install UI app

## Installation of the UI app

1. `git clone https://github.com/poanetwork/bridge-ui.git`  
2. `cd bridge-ui`  
3. `npm install`  
4. Please create .env file [.env.example](.env.example)  
`cp .env.example .env`  
5. Insert addresses from  
`cat ../poa-bridge-contracts/deploy/bridgeDeploymentResults.json`  
```bash
REACT_APP_HOME_BRIDGE_ADDRESS=0x902a15b45a3cD1A8aC5ab97c69C8215FC26763eA
REACT_APP_FOREIGN_BRIDGE_ADDRESS=0x902a15b45a3cD1A8aC5ab97c69C8215FC26763eA
REACT_APP_FOREIGN_HTTP_PARITY_URL=https://kovan.infura.io/mew
REACT_APP_HOME_HTTP_PARITY_URL=https://sokol.poa.network
REACT_APP_GAS_PRICE_SPEED_TYPE=fast
```
Explanation:

Name | Description
--------- | -------
REACT_APP_HOME_BRIDGE_ADDRESS | address that you have deployed at step#3. Should also be recorded at `sokol-kovan-bridge/poa-bridge-contracts/deploy/bridgeDeploymentResults.json`
REACT_APP_FOREIGN_BRIDGE_ADDRESS | address that you have deployed at step#3.
REACT_APP_FOREIGN_HTTP_PARITY_URL | http public rpc node for Foreign Network
REACT_APP_HOME_HTTP_PARITY_URL | http public rpc node for Foreign Network
REACT_APP_GAS_PRICE_SPEED_TYPE | Gas Price speed (slow, standard, fast, instant)

5. Run `npm run start`
6. Make sure you have https://metamask.io installed
7. Switch to account with POA tokens in your metamask or fund an account using https://faucet-sokol.herokuapp.com/
8. Specify amount and click on Arrow button to make a cross chain transaction from Sokol to Kovan

## Tests

To run tests

`npm run test`

To run tests with coverage

`npm run coverage`

## Optional 
- Ansible playbooks for deployment:
  https://github.com/poanetwork/deployment-bridge/tree/master/upgradable-wo-parity

  In order to simplify deployment for production environments, we have created ansible playbook that allow you
  to deploy separate bridge instances for your validators.
- Bridge Monitoring: https://github.com/poanetwork/bridge-monitor

  In order to setup PagerDuty alerts for all administrators of the bridge, there is monitoring server that needs to deployed separately to make sure it notifies all interested parties of the status of the bridge contracts.
