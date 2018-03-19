![Demo](demo.gif)
## POA Bridge UI app
Cross-chain bridge is capable of connecting any Ethereum-compatible networks (such as Ethereum Foundation, Ethereum Classic, Ubiq, Expanse, POA Network, Rootstock and others ) to each other.<br/>
A bridge for cross-chain transactions is an app which runs on multiple computers with two contracts on both sides of the bridge. On the left side of the bridge (POA Network), the app listens to events from the Home Bridge contract, and on the right side of the bridge (Ethereum Foundation), it creates ERC20 tokens corresponding to these events mapped 1:1.<br/>
The contract on the right side of the bridge accepts transactions signed by authorities of the POA consensus. A subset of validators on POA Network runs the bridge software. If you trust authorities of the POA Network, then you inherit this trust into the bridge, i.e. the assets are transferred in a trustless manner.<br/>
[Read more](https://medium.com/poa-network/cross-chain-bridges-paving-the-way-to-internet-of-blockchains-422ac94bc2e5)


Using current implementation of Bridges, it allows a use to tokenize his native coin of a evm network into ERC20 representation token on another evm compatible network. 
Security considerations:
In order to provide better decentralization of the bridges, you can increase number of required signatures and expand your list of validators. You should also increase block confirmation to have better protections from double spending attacks.
POA smart contracts allows maintainers of the bridges to 
- Upgrade smart contracts by fixing potential security vulnerabilities in smart contract with multisig contract
- Add validators
- Remove validators
- Set required number of signatures from validators
- Set daily limit of deposits on Home Network(left side) for native coin deposits(POA)
- Set daily limit of withdrawals on Foreign Network(right side) for ERC20/ERC677 token transfers(POA20)
- Storing Home Deposits in Home Bridge contract
- Minting on Deposits ERC20 compatible token on Foreign Network by validators
- Burning on Withdrawals ERC20 compatible token on Foreign Network by validators

Bridge UI  features:
- show daily limits in both networks
- display all events in both networks
- filter events from specific block number on both sides
- find corresponding event on different side of the network
- Submit a transaction from Home to Foreign network
- Submit a transaction from Foreign to Home network

## Bridge UI
Bridge UI allows users to explore all cross chain transactions that are happening. User can easily submit a transaction in both sides of the networks. 
#### From Home to Foreign Network transaction:
If a user wants to tokenize his native POA coin, she can send specify an amount and click a -> arrow button to send a transaction via Metamask within daily limits provided by the contracts. When transaction is validated, the user should expect to see Deposit event on Home Network(left side - POA network) and then after some time, validators submit signatures emitting SignedForDeposit event,to the foreign network. Once required number of signatures reached, Deposit event is emitted on Foreign network, hence ERC20 token is also minted on foreign network with the corresponding deposit to the address of recipient.

#### From Foreign to Home Network transaction:
If a user wants to burn his ERC20 compatible POA20 token, she can send specify an amount and click a Switch button and click on <-  arrow button to send a transaction via Metamask within daily limits provided by the contracts. When transaction is validated, a user should expect to see Withdrawal event on Foreign Network(right side - Ethereum Foundation) and then after some time, validators submit signatures emitting SignedForWithdrawal event,to the foreign network. Once required number of signatures reached, CollectedSignatures event is emitted on Foreign network, hence ERC20 token is also burnt on foreign network. It generates a signed message which validators submit on Home Network, therefore the user automatically receives his native POA coin in Home Network.


## Dependencies

- [poa-bridge-contracts](https://github.com/poanetwork/poa-parity-bridge-contracts/tree/upgradable)
- [parity node 1.9.3](https://www.parity.io/) for Home Network 
- [parity node 1.9.3](https://www.parity.io/) for Foreign Network
- [node.js](https://nodejs.org/en/download/)
- [jq](https://stedolan.github.io/jq/)
- [metamask](https://metamask.io/)
- happy mood and patience

## Preparation for using the UI App
0. Create empty folder where you will be setting up your bridge. In the following example lets call it `sokol-kovan-bridge`
Folder structure:
```bash
.
└── sokol-kovan-bridge
    ├── ForeignBridge_bytecode.bin
    ├── HomeBridge_bytecode.bin
    ├── bridge-ui
    ├── config.toml
    ├── db.toml
    ├── parity-bridge
    ├── kovan-node
    ├── sokol-node
    └── poa-parity-bridge-contracts
```
1. Install parity (Current setup was tested against parity 1.9.3)
2. Setup Home Network node. In this example, we will use `sokol-node` folder
Example: POA-Sokol:
  * Download Sokol spec.json file from [here](https://github.com/poanetwork/poa-chain-spec/blob/sokol/spec.json)
  * Download Sokol bootnodes.txt file from [here](https://github.com/poanetwork/poa-chain-spec/blob/sokol/bootnodes.txt)
  * Create sokol.toml file
```bash
# Sokol
[parity]
chain = "spec.json" # For Sokol https://github.com/poanetwork/poa-chain-spec/blob/sokol/spec.json
base_path = "sokol-datadir" #folder where the blockchain will be synced and keys stored
[network]
port = 30305
discovery=true
reserved_peers = "./bootnodes.txt" #bootnodes file For Sokol: https://github.com/poanetwork/poa-chain-spec/blob/sokol/bootnodes.txt
[rpc]
cors = ["all"]
interface = "all"
hosts = ["all"]
port = 8545 # port needed for truffle.js config 
apis = ["web3", "eth", "net", "parity", "rpc", "secretstore", "traces"]
[websockets]
disable = false
port = 8546 # port for WS connection which you should provide in .env later as REACT_APP_HOME_WEB_SOCKETS_PARITY_URL
interface = "all"
origins = ["all"]
apis = ["web3", "eth", "net", "parity", "rpc", "secretstore", "pubsub"]
hosts = ["all"]
[account]
unlock = ["0xETH_ACCOUNT_VALIDATOR_SOKOL"] # Please provide your OWN ETH public Key here
password = ["parity_password"] # specify password for the  key above

```
  * from the config above you have to create `keys` folder in: `sokol-datadir/keys/Sokol` and insert your JSON keystore `0xETH_ACCOUNT_VALIDATOR_SOKOL` eth key
  * create `parity_password` file and store password for your public key in plaintext format
  * run your Home(sokol) node
```bash
parity --config sokol.toml --nat=none --no-ui
```

3. Get POA Bridge contracts:
  * `git clone -b upgradable git@github.com:poanetwork/poa-parity-bridge-contracts.git`
  * `cd poa-parity-bridge-contracts && npm install`
  * open `truffle.js` file and make sure you add the following your home network config:
```js
module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*" // Match any network id
    },
    home: {
      host: "localhost",
      port: "8545", // check your sokol.toml [rpc] port section
      network_id: "*",
      gas: 4700000,
      gasPrice: 1000000000
    }
  }
};
```
  * Make sure your parity Home(sokol) node is fully synced by this step
  * Run the deployment script with following parameters:
```bash
VALIDATORS="0xETH_ACCOUNT_VALIDATOR_SOKOL 0xVALIDATOR_2" REQUIRED_NUMBER_OF_VALIDATORS=1 HOME_LIMIT=1000000000000000000 NETWORK=home npm run deploy
```
```ruby
Explanation of parameters:
VALIDATORS - list of validators who can validate bridge transactions
REQUIRED_NUMBER_OF_VALIDATORS - how many signatures will be required in order to relay a tx
HOME_LIMIT - daily limit in Wei (in the example above is 1 eth)
NETWORK - reads truffle.js network
```
  * Wait when deployment is done
  * when the deployment is finished you will have something like this: 
```js
all is done
  validators: 0xb8988b690910913c97a090c3a6f80fad8b3a4683
  Owner: 0xb8988b690910913c97a090c3a6f80fad8b3a4683
  Foreign Bridge: 0xdceabcfa4ffa7765913cd002c67f123127e2f762
  Home Bridge: 0x030caae2549fc2584879c8713d3e98d1ab615235
  POA20: 0x3ac82ca0ab3d78e131cc563c72716d11fc3795f8
```
  * Copy only `Home Bridge:` line and save it somewhere else

4. Setup Foreign Network node.
I will be using Kovan for this example in the folder `kovan-node`
  * prepare kovan.toml
```bash
# Kovan
[parity]
chain = "kovan" # Parity comes in with built-in kovan spec file
base_path = "kovan-datadir" #folder where the blockchain will be synced and keys stored
[network]
port = 30308 # make sure it's different from sokol.toml network port
discovery=true
[rpc]
cors = ["all"]
interface = "all"
hosts = ["all"]
port = 8591 # port needed for truffle.js config. Please make sure it's different from sokol.toml
apis = ["web3", "eth", "net", "parity", "rpc", "secretstore", "traces"]
[websockets]
disable = false
port = 8541 # port for WS connection which you should provide in .env later as REACT_APP_FOREGIGN_WEB_SOCKETS_PARITY_URL
interface = "all"
origins = ["all"]
apis = ["web3", "eth", "net", "parity", "rpc", "secretstore", "pubsub"]
hosts = ["all"]
[account]
unlock = ["0xETH_ACCOUNT_VALIDATOR_KOVAN"] # Please provide your OWN ETH public Key here for Validator
password = ["parity_password"] # specify password for the  key above

```
* from the config above you have to create `keys` folder in: `sokol-datadir/keys/kovan` and insert your JSON keystore `0xETH_ACCOUNT_VALIDATOR_KOVAN` eth key that will be used for validation of the bridge
* create `parity_password` file and store password for your public key in plaintext format
* run your Foreign(Kovan) node
```bash
parity --config kovan.toml --nat=none --no-ui
```
* Please make sure you are fully synced Foreign(kovan) network chain by this step
* Go back to your `poa-parity-bridge-contracts` folder where you previosly used for Home contracts deployment
* open `truffle.js` file and make sure you add the following your home network config:
```js
module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*" // Match any network id
    },
    home: {
      host: "localhost",
      port: "8545", // check your sokol.toml [rpc] port section
      network_id: "*",
      gas: 4700000,
      gasPrice: 1000000000
    },
    foreign: {
      host: "localhost",
      port: "8591", // check your kovan.toml [rpc] port section
      network_id: "*",
      gas: 4700000,
      gasPrice: 1000000000
    }
  }
};
```
  * Run the deployment script with following parameters:
```bash
VALIDATORS="0xVALIDATOR_1 0xVALIDATOR_2" REQUIRED_NUMBER_OF_VALIDATORS=1 FOREIGN_LIMIT=1000000000000000000 NETWORK=foreign npm run deploy
```
  * Wait when deployment is done
  * when the deployment is finished you will have something like this: 
```js
all is done
  validators: 0xb8988b690910913c97a090c3a6f80fad8b3a4683
  Owner: 0xb8988b690910913c97a090c3a6f80fad8b3a4683
  Foreign Bridge: 0xd586e9f2da9f496bfc28c9092166ea52c8024a5d
  Home Bridge: 0x6263f1fbff2dc1e8ed5e52168e9760a3613b1877
  POA20: 0x064cafec541a4faf9b7c4ffe4257d50cf0775df5
```
  * Copy only `Foreign Bridge: ...` line and save it somewhere else

5. Install parity-bridge binary

requires `rust` and `cargo`: [installation instructions.](https://www.rust-lang.org/en-US/install.html)

requires `solc` to be in `$PATH`: [installation instructions.](https://solidity.readthedocs.io/en/develop/installing-solidity.html)

assuming you've cloned the bridge (`git clone git@github.com:paritytech/parity-bridge.git`)
and are in the project directory (`cd parity-bridge`) run:

```
cargo build -p bridge-cli --release
```
6. Install [jq](https://stedolan.github.io/jq/)
7. Create `HomeBridge_bytecode.bin` with the following command:
```bash
cat sokol-kovan-bridge/poa-parity-bridge-contracts/build/contracts/HomeBridge.json | jq '.bytecode' -r | cut -c 3- > HomeBridge_bytecode.bin
```
8. Create `ForeignBridge_bytecode.bin` with the following command:
```bash
cat sokol-kovan-bridge/poa-parity-bridge-contracts/build/contracts/ForeignBridge.json | jq '.bytecode' -r | cut -c 3- > ForeignBridge_bytecode.bin
```
9. Create `config.toml` file
```yaml
estimated_gas_cost_of_withdraw = 0
[home]
#account which you specified as validator on Home network
account = "0xETH_ACCOUNT_VALIDATOR_SOKOL" 
#Full  IPC path to your HOME node
ipc = "/Users/USERNAME/sokol-kovan-bridge/sokol-node/sokol-datadir/jsonrpc.ipc"
# How many block confirmation to wait to send a tx
required_confirmations = 0

[home.contract]

bin = "HomeBridge_bytecode.bin"

[foreign]
account = "0xETH_ACCOUNT_VALIDATOR_KOVAN"
ipc = "/Users/USERNAME/sokol-kovan-bridge/kovan-node/kovan-datadir/jsonrpc.ipc"
required_confirmations = 0

[foreign.contract]
bin = "ForeignBridge_bytecode.bin"

[authorities]
accounts = [
  "0xETH_ACCOUNT_VALIDATOR_SOKOL",
  "0xETH_ACCOUNT_VALIDATOR_KOVAN"
]
required_signatures = 1

[transactions]
home_deploy = { gas = 3000000 }
foreign_deploy = { gas = 3000000 }
deposit_relay = { gas = 3000000 }
withdraw_relay = { gas = 3000000 }
withdraw_confirm = { gas = 3000000 }
```
10. Create db.toml file
```yaml
home_contract_address = "0x030caae2549fc2584879c8713d3e98d1ab615235" #YOUR HOME CONTRACT ADDRESS THAT YOU DEPLOYED IN STEP#3 
foreign_contract_address = "0xd586e9f2da9f496bfc28c9092166ea52c8024a5d" #YOUR FOREIGN CONTRACT ADDRESS THAT YOU DEPLOYED IN STEP#4
home_deploy = 1400663 # block number at which the contract was created for home contract
foreign_deploy = 6342830 # block number at which the contract was created for foreign contract
checked_deposit_relay = 1400663 # last checked deposits events on Home network
checked_withdraw_relay = 6342830 # last checked withdraw events on Foreign network
checked_withdraw_confirm = 6342830 # last checked withdraw events on Foreign network
```
11. At this step your folder structure should look like this
```bash
.
└── sokol-kovan-bridge
    ├── ForeignBridge_bytecode.bin
    ├── HomeBridge_bytecode.bin
    ├── bridge-ui
    ├── config.toml
    ├── db.toml
    ├── parity-bridge
    ├── kovan-node
    ├── sokol-node
    └── poa-parity-bridge-contracts
```
12. Run the bridge app:
```
env RUST_LOG=info ./parity-bridge/target/release/bridge --config config.toml --database db.toml
```

If everything went well, you should see some logs from the  bridge:
```bash
INFO:bridge: Parsing cli arguments
INFO:bridge: Loading config
INFO:bridge: Starting event loop
INFO:bridge: Establishing ipc connection
INFO:bridge: Deploying contracts (if needed)
INFO:bridge: Loaded database
INFO:bridge: Starting listening to events
INFO:bridge::bridge::deposit_relay: got 0 new deposits to relay
INFO:bridge::bridge::deposit_relay: relaying 0 deposits
INFO:bridge::bridge::deposit_relay: deposit relay completed
INFO:bridge::bridge::withdraw_relay: got 0 new signed withdraws to relay
INFO:bridge::bridge::withdraw_relay: fetching messages and signatures
INFO:bridge::bridge::withdraw_relay: fetching messages and signatures complete
INFO:bridge::bridge::withdraw_relay: relaying 0 withdraws
INFO:bridge::bridge::withdraw_relay: relaying withdraws complete
INFO:bridge::bridge::withdraw_confirm: got 0 new withdraws to sign
INFO:bridge::bridge::withdraw_confirm: signing
INFO:bridge::bridge::withdraw_confirm: signing complete
INFO:bridge::bridge::withdraw_confirm: submitting 0 signatures
INFO:bridge::bridge::withdraw_confirm: submitting signatures complete
INFO:bridge::bridge::withdraw_relay: waiting for signed withdraws to relay
INFO:bridge::bridge::withdraw_confirm: waiting for new withdraws that should get signed
```
13. Install UI app

## Installation of the UI app

1. `git clone git@github.com:poanetwork/bridge-ui.git`
2. `cd bridge-ui`
3. `npm install`
4. Please create .env file [.env.example](.env.example)
```bash
REACT_APP_HOME_BRIDGE_ADDRESS=0x030caae2549fc2584879c8713d3e98d1ab615235
REACT_APP_FOREIGN_BRIDGE_ADDRESS=0xd586e9f2da9f496bfc28c9092166ea52c8024a5d
REACT_APP_FOREGIGN_WEB_SOCKETS_PARITY_URL=ws://localhost:8541
REACT_APP_HOME_WEB_SOCKETS_PARITY_URL=ws://localhost:8546
```
Explanation: 
```js
REACT_APP_HOME_BRIDGE_ADDRESS - address that you have deployed at step#3
REACT_APP_FOREIGN_BRIDGE_ADDRESS - address that you have deployed at step#4
REACT_APP_FOREGIGN_WEB_SOCKETS_PARITY_URL - websocket port for Foreign Network that you specified at step# 4 in kovan.toml file
REACT_APP_HOME_WEB_SOCKETS_PARITY_URL - websocket port for Home Network that you specified at step# 3 in sokol.toml file
```
5. Run `npm run start`