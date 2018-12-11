import Web3 from 'web3'
import Web3Utils from 'web3-utils'
import BN from 'bignumber.js'

const getWeb3 = () => {
  return new Promise(function (resolve, reject) {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load',async function () {
      let web3 = window.web3
      const { ethereum } = window

      if (ethereum) {
        web3 = new window.Web3(ethereum)
        try {
          // Request account access
          await ethereum.enable()
          processWeb3(web3, resolve,  reject)
        } catch (error) {
          console.log(error)
          const errorMsg = `Wallet account rejected by user. You need to unlock your wallet.
           Please refresh the page and click 'Connect' button in your wallet popup.`
          reject({ type: 'rejected', message: errorMsg })
        }
      } else if (typeof web3 !== 'undefined') {
        web3 = new window.Web3(web3.currentProvider)
        processWeb3(web3, resolve,  reject)
      } else {
        // Fallback to localhost if no web3 injection.
        const errorMsg = ''
        reject({ type: 'install', message: errorMsg })
        console.log('No web3 instance injected, using Local web3.');
        console.error('wallet not found');
      }
    })
  })
}

export default getWeb3

const networks = {
  1: 'ETH Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  30: 'RSK Mainnet',
  31: 'RSK Testnet',
  42:'Kovan',
  77:'Sokol',
  99: 'POA Network',
  100: 'Dai Chain'
}

export const getNetworkName = (id) => networks[id] || 'Unknown'

export const getBalance = async (web3, address) => {
  const balance = await web3.eth.getBalance(address)
  return Web3Utils.fromWei(balance)
}

export const getWeb3Instance = (provider) => {
  const web3Provider = new Web3.providers.HttpProvider(provider);
  return new Web3(web3Provider);
}

export const getNetwork = async (web3) => {
  const id = await web3.eth.net.getId()
  const name = getNetworkName(id)
  return {
    id,
    name
  }
}

export const getBlockNumber = (web3) => web3.eth.getBlockNumber()

export const estimateGas = async (web3, to, gasPrice, from, value, data) =>{
  const gas = await web3.eth.estimateGas({to, gasPrice, from, value, data})
  return Web3Utils.toHex(gas.toString())
}

export const fromDecimals = (number, decimals) => {
  if (decimals == null) {
    decimals = 18;
  }
  const returnValue = toBigNumber(number).dividedBy(Math.pow(10, decimals));
  return isBigNumber(number) ? returnValue : returnValue.toString(10);
};

export const toDecimals = (number, decimals) => {
  if (decimals == null) {
    decimals = 18;
  }
  const returnValue = toBigNumber(number).times(Math.pow(10, decimals));
  return isBigNumber(number) ? returnValue : returnValue.toString(10);
};

const isBigNumber = (object) => {
    return (object && (object instanceof BN || (object.constructor && object.constructor.name === 'BigNumber')));
};

const toBigNumber = (number) => {
    /*jshint maxcomplexity:5 */
    number = number || 0;
    if (isBigNumber(number))
        return number;
    if (isString(number) && (number.indexOf('0x') === 0 || number.indexOf('-0x') === 0)) {
        return new BN(number.replace('0x',''), 16);
    }
    return new BN(number.toString(10), 10);
};

const isString = (object) => {
    return typeof object === 'string' ||
        (object && object.constructor && object.constructor.name === 'String');
};

const processWeb3 = (web3, resolve,  reject) => {
  web3.version.getNetwork((err, netId) => {
    const netIdName = getNetworkName(netId)
    console.log(`This is ${netIdName} network.`, netId)
    document.title = `${netIdName} - Bridge UI dApp`
    const defaultAccount = web3.eth.defaultAccount || null;
    if(defaultAccount === null){
      reject({ type: 'unlock', message: 'Please unlock your wallet and refresh the page' })
    }
    const results = {
      web3Instance: new Web3(web3.currentProvider),
      netIdName,
      netId,
      injectedWeb3: true,
      defaultAccount
    }
    resolve(results)
  })
}
