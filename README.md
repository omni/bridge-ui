![Demo](demo.gif)
### Deployed URL

https://poanetwork.github.io/bridge-ui/#/

### Related repositories  
Rust Binary: https://github.com/poanetwork/parity-bridge :hatched_chick:  
Smart Contracts: https://github.com/poanetwork/poa-parity-bridge-contracts  :hatched_chick:  
Ansible Deployment: https://github.com/poanetwork/deployment-bridge/tree/master/upgradable :hatching_chick:     

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

# Responsibilities and roles of the bridge:
- Administrator Role(representation of a multisig contract):
  - add/remove validators
  - set daily limits on both bridges
  - set maximum per transaction limit on both bridges
  - upgrade contracts in case of vulnerability
  - set minimum required signatures from validators in order to relay a user's transaction
- Validator Role :
  - provide 100% uptime to relay transactions
  - listen for Deposit events on Home bridge to mint erc20 token on Foreign bridge
  - listen for Withdraw events on Foreign bridge to unlock funds on Home Bridge
- User role:
  - sends POA coins to Home bridge in order to receive ERC20 token on Foreign Bridge using the same address to send/receive
  - sends ERC20 POA20 token on Foreign Bridge in order to receive POA coins on Home Bridge using the same address to send/receive

## Dependencies

- [poa-bridge-contracts](https://github.com/poanetwork/poa-parity-bridge-contracts/)
- [parity node 1.9.5](https://www.parity.io/) for Home Network 
- [parity node 1.9.5](https://www.parity.io/) for Foreign Network
- [node.js](https://nodejs.org/en/download/)
- [jq](https://stedolan.github.io/jq/)
- [metamask](https://metamask.io/)
- happy mood and patience

## Preparation for using the UI App
1. Create empty folder where you will be setting up your bridge. In the following example lets call it `sokol-kovan-bridge`  
`mkdir sokol-kovan-bridge && cd sokol-kovan-bridge`  

### 2. Deploy Sokol <-> Kovan Bridge contracts:  
In this example, I'm going to use the same address for `HOME_PROXY_OWNER` and `FOREIGN_PROXY_OWNER`.   
Example: `0x08660156928d768D26D3eeF642c11527FDca0891`  
For `HOME_VALIDATORS` and `FOREIGN_VALIDATORS` I'm also going to use the same address.   
Example: `0x7A6a585dB8cDFa88B9e8403c054ec2e912E9D32E`  
Feel free to use diffrent on both chain, for simplicity of this tutorial, I'm going to reuse them on both chains.

  * `HOME_PROXY_OWNER` and  `FOREIGN_PROXY_OWNER`: Generate New Ethereum Private Key https://www.myetherwallet.com/#generate-wallet
  * `HOME_VALIDATORS` and `FOREIGN_VALIDATORS`: Generate New Ethereum Keystore File JSON and its password https://www.myetherwallet.com/#generate-wallet
  * Fund Home accounts using Sokol Faucet URL:
  https://faucet-sokol.herokuapp.com/ 
  * Get free Kovan Coins from the [gitter channel](https://gitter.im/kovan-testnet/faucet) or [Iracus faucet](https://github.com/kovan-testnet/faucet) to Foreign Accounts. Get 5 Keth to 1 acc, and transfer from it to all others.
  * `git clone https://github.com/poanetwork/poa-parity-bridge-contracts.git`
  * `cd poa-parity-bridge-contracts && npm install`
  * `./node_modules/.bin/truffle compile`
  * `cd ./deploy && npm install`
  * `cp .env.example .env`
  * `nano .env`
```rust
HOME_RPC_URL=https://sokol.poa.network
HOME_PROXY_OWNER=0x08660156928d768D26D3eeF642c11527FDca0891
HOME_PROXY_OWNER_PRIVATE_KEY=INSERT_PRIVATE_KEY_HERE
HOME_REQUIRED_NUMBER_OF_VALIDATORS=1
HOME_VALIDATORS="0x7A6a585dB8cDFa88B9e8403c054ec2e912E9D32E"
HOME_DAILY_LIMIT=1000000000000000000
HOME_MAX_AMOUNT_PER_TX=100000000000000000
HOME_MIN_AMOUNT_PER_TX=10000000000000000
FOREIGN_RPC_URL=https://kovan.infura.io/mew
FOREIGN_PROXY_OWNER=0x08660156928d768D26D3eeF642c11527FDca0891
FOREIGN_PROXY_OWNER_PRIVATE_KEY=INSERT_PRIVATE_KEY_HERE
FOREIGN_REQUIRED_NUMBER_OF_VALIDATORS=1
FOREIGN_VALIDATORS="0x7A6a585dB8cDFa88B9e8403c054ec2e912E9D32E"
FOREIGN_DAILY_LIMIT=1000000000000000000
FOREIGN_MAX_AMOUNT_PER_TX=100000000000000000
FOREIGN_MIN_AMOUNT_PER_TX=10000000000000000
GAS_PRICE=1
```

#### Explanation of parameters:
`HOME_RPC_URL` - Public RPC Node URL for Home Network  
`HOME_PROXY_OWNER` - Address of Administrator role on Home network  
`HOME_PROXY_OWNER_PRIVATE_KEY` - Private key of HOME_PROXY_OWNER  
`HOME_REQUIRED_NUMBER_OF_VALIDATORS` - Minimum Number of validators in order to Withdraw Funds on POA network Sokol  
`HOME_VALIDATORS` - array of validators on Home network. Space separated.  
`HOME_DAILY_LIMIT` - Daily Limit in Wei. Example above is `1 eth`  
`HOME_MAX_AMOUNT_PER_TX` - Max limit per 1 tx in Wei. Example above is `0.1 eth`  
`HOME_MIN_AMOUNT_PER_TX` - Minimum amount per 1 tx in Wei. Example above is `0.01 eth`  
`FOREIGN_RPC_URL` - Public RPC Node URL for Foreign Network  
`FOREIGN_PROXY_OWNER` - Address of Administrator role on Foreign network  
`FOREIGN_PROXY_OWNER_PRIVATE_KEY` - Private key of FOREIGN_PROXY_OWNER  
`FOREIGN_REQUIRED_NUMBER_OF_VALIDATORS` - Minimum Number of validators in order to mint ERC20 token on Foreign network  
`FOREIGN_VALIDATORS` - array of validators on Home network. Space separated.  
`FOREIGN_DAILY_LIMIT` - Daily Limit in Wei. Example above is `1 eth`  
`FOREIGN_MAX_AMOUNT_PER_TX` - Max limit per 1 tx in Wei. Example above is `0.1 eth`  
`FOREIGN_MIN_AMOUNT_PER_TX` - Minimum amount per 1 tx in Wei. Example above is `0.01 eth`  
`GAS_PRICE` -  Gas Price to use for every tx on both networks in gwei  

3. run `node deploy.js`  

As a result you should have the following output:  
```bash
[   Home  ] HomeBridge:  0xE460DD303Abf282Bde9f7c9cB608D1E1a7c02E0a
[ Foreign ] ForeignBridge:  0x902a15b45a3cD1A8aC5ab97c69C8215FC26763eA
[ Foreign ] POA20:  0xAb121C134aD7e128BE06fEaf40b494F9865F794b
Contracts Deployment have been saved to `bridgeDeploymentResults.json`
```
The deployment information is also located in `bridgeDeploymentResults.json`  
When you are done, go back to `sokol-kovan-bridge` folder   
`cd ../../`


## 4. Setting up Validator Node

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
1. Install parity (Current setup was tested against parity 1.9.5) https://www.parity.io/
2. Setup Home Network node. In this example, we will use `sokol-node` folder  
`mkdir sokol-node && cd sokol-node`  

Example: POA-Sokol:
  * Download Sokol spec.json file from [here](https://github.com/poanetwork/poa-chain-spec/blob/sokol/spec.json)  
`curl -O https://raw.githubusercontent.com/poanetwork/poa-chain-spec/sokol/spec.json`  
  * Download Sokol bootnodes.txt file from [here](https://github.com/poanetwork/poa-chain-spec/blob/sokol/bootnodes.txt)  
`curl -O https://raw.githubusercontent.com/poanetwork/poa-chain-spec/sokol/bootnodes.txt`  
  * Get JSON Keystore file that you used for `HOME_VALIDATORS` variable above  
Example: `UTC--2018-04-11T02-07-51.479Z--4561b919f97adb462384ebffc7a3e6aeaa133db6`  
  * Fund this address from Sokol Faucet: https://faucet-sokol.herokuapp.com/  
  * Create sokol.toml file replace below `0xETH_ACCOUNT_VALIDATOR_SOKOL` which should match `HOME_VALIDATORS`  
`touch sokol.toml`
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
[account]
unlock = ["0xETH_ACCOUNT_VALIDATOR_SOKOL"] # Please provide your OWN ETH public Key here
password = ["parity_password"] # specify password for the  key above

```
For the `0xETH_ACCOUNT_VALIDATOR_SOKOL` ETH public key provided in the config above:
* create `parity_password` file and store password in plaintext format
`nano parity_password`
`Password123`
Exit from `nano` by Ctrl-O and Ctrl-X
* Create the folders `sokol-datadir/keys/Sokol` and insert your JSON keystore there
`mkdir -p sokol-datadir/keys/Sokol`
`mv UTC--2018-04-11T02-07-51.479Z--4561b919f97adb462384ebffc7a3e6aeaa133db6 sokol-datadir/keys/Sokol`


Run your Home(sokol) node
```bash
parity --config sokol.toml --nat=none --no-ui
```
Open separate terminal window and go to your `sokol-kovan-bridge` folder
`cd ..`

## 4. Setup Foreign Network node.

* Get JSON Keystore file that you used for `FOREIGN_VALIDATORS` variable above
Example: `UTC--2018-04-11T02-07-51.479Z--4561b919f97adb462384ebffc7a3e6aeaa133db6`
  * Fund this address if you haven't done so from Kovan Faucet: https://gitter.im/kovan-testnet/faucet
  * Create `config.toml` file replace below `0xETH_ACCOUNT_VALIDATOR_KOVAN` which should match `FOREIGN_VALIDATORS`
`touch config.toml`

I will be using Kovan for this example in the folder `kovan-node`
  * prepare config.toml
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

[account]
unlock = ["0xETH_ACCOUNT_VALIDATOR_KOVAN"] # Please provide your OWN ETH public Key here for Validator
password = ["parity_password"] # specify password for the  key above

```
For the `0xETH_ACCOUNT_VALIDATOR_KOVAN` ETH public key provided in the config above:
* create `parity_password` file and store password in plaintext format
`nano parity_password`
`Password123`
Exit from `nano` by Ctrl-O and Ctrl-X
* Create the folders `kovan-datadir/keys/kovan` and insert your JSON keystore there
`mkdir -p kovan-datadir/keys/kovan`
`mv UTC--2018-04-11T02-07-51.479Z--4561b919f97adb462384ebffc7a3e6aeaa133db6 kovan-datadir/keys/kovan`

Run your Foreign(Kovan) node
```bash
parity --config config.toml --nat=none --no-ui
```
Open separate terminal window and go to your `sokol-kovan-bridge` folder
`cd ..`

## 5. Install parity-bridge binary

* Install `rust` and `cargo`: [installation instructions.](https://www.rust-lang.org/en-US/install.html)

* Install `solc` and add it to `$PATH`: [installation instructions.](https://solidity.readthedocs.io/en/develop/installing-solidity.html)

* `git clone https://github.com/poanetwork/parity-bridge.git`
* `cd parity-bridge`
* Run:

```
cargo build -p bridge-cli --release
```
6. Install [jq](https://stedolan.github.io/jq/)
7. Go back to directory up.
`cd ..`
8. Create `HomeBridge_bytecode.bin` with the following command:
```bash
cat ../sokol-kovan-bridge/poa-parity-bridge-contracts/deploy/bridgeDeploymentResults.json | jq '.homeBridge.bytecode' -r > HomeBridge_bytecode.bin
```
8. Create `ForeignBridge_bytecode.bin` with the following command:
```bash
cat ../sokol-kovan-bridge/poa-parity-bridge-contracts/deploy/bridgeDeploymentResults.json | jq '.foreignBridge.bytecode' -r > ForeignBridge_bytecode.bin
```
9. Create `config.toml` file
`touch config.toml`
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
home_contract_address = "0xE460DD303Abf282Bde9f7c9cB608D1E1a7c02E0a" #YOUR HOME CONTRACT ADDRESS THAT YOU DEPLOYED IN STEP#3 
foreign_contract_address = "0x902a15b45a3cD1A8aC5ab97c69C8215FC26763eA" #YOUR FOREIGN CONTRACT ADDRESS THAT YOU DEPLOYED IN STEP#4
home_deploy = 1400663 # block number at which the contract was created for home contract you can find in `bridgeDeploymentResults.json`
foreign_deploy = 6342830 # block number at which the contract was created for foreign contract you can find in `bridgeDeploymentResults.json`
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
Open separate terminal window and go to your `sokol-kovan-bridge` folder

13. Install UI app

## Installation of the UI app

1. `git clone https://github.com/poanetwork/bridge-ui.git`
2. `cd bridge-ui`
3. `npm install`
4. Please create .env file [.env.example](.env.example)
```bash
REACT_APP_HOME_BRIDGE_ADDRESS=0x902a15b45a3cD1A8aC5ab97c69C8215FC26763eA
REACT_APP_FOREIGN_BRIDGE_ADDRESS=0x902a15b45a3cD1A8aC5ab97c69C8215FC26763eA
REACT_APP_FOREIGN_HTTP_PARITY_URL=https://kovan.infura.io/mew
REACT_APP_HOME_HTTP_PARITY_URL=https://sokol.poa.network
```
Explanation: 
```js
REACT_APP_HOME_BRIDGE_ADDRESS - address that you have deployed at step#3. Should alose be recorded at `sokol-kovan-bridge/poa-parity-bridge-contracts/deploy/bridgeDeploymentResults.json`
REACT_APP_FOREIGN_BRIDGE_ADDRESS - address that you have deployed at step#3.
REACT_APP_FOREIGN_HTTP_PARITY_URL - http public rpc node for Foreign Network
REACT_APP_HOME_HTTP_PARITY_URL - http public rpc node for Foreign Network
```
5. Run `npm run start`
6. Make sure you have https://metamask.io installed
7. Specify amount and click on Arrow button to make a cross chain transaction from Sokol to Kovan
