import Web3 from 'web3'
import Web3Utils from 'web3-utils'

const getWeb3 = () => {
  return new Promise(function (resolve, reject) {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', function () {
      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof window.ethereum !== 'undefined') {
        // Use Mist/MetaMask's provider.
        window.ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
          window.ethereum.request({ method: 'eth_chainId' }).then(chainId => {
            const netId = parseInt(chainId.slice(2), 16)
            const netIdName = getNetworkName(netId)
            console.log(`This is ${netIdName} network.`, netId)
            document.title = `${netIdName} - Bridge UI dApp`
            const defaultAccount = accounts[0] || null;
            if(defaultAccount === null){
              reject({message: 'Please unlock your metamask and refresh the page'})
            }
            const results = {
              web3Instance: new Web3(window.ethereum),
              netIdName,
              netId,
              injectedWeb3: true,
              defaultAccount
            }
            resolve(results)
          })
          window.ethereum.on('chainChanged', () => window.location.reload())
        })
      } else {
        // Fallback to localhost if no web3 injection.
        const errorMsg = `Metamask is not installed. Please go to
        <a target="_blank" href="https://metamask.io">Metamask website</a> and return to this page after you installed it`
        reject({message: errorMsg})
        console.log('No web3 instance injected, using Local web3.');
        console.error('Metamask not found');
      }
    })
  })
}

export default getWeb3

const networks = {
  1: 'Network',
  3: 'Ropsten',
  4: 'Rinkeby',
  42:'Kovan',
  77:'Sokol',
  99:'Network'
}

const explorers = {
  1: 'https://etherscan.io/',
  3: 'https://ropsten.etherscan.io/',
  4: 'https://rinkeby.etherscan.io/',
  42:'https://kovan.etherscan.io/',
  77:'https://blockscout.com/poa/sokol/',
  99:'https://blockscout.com/poa/core/'
}

export const getExplorerUrl = (id) => explorers[id]

export const getAddressUrl = (id) => getExplorerUrl(id) + 'address/'

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

export const getGasPrices = () => fetch('https://gasprice-netlify.netlify.app/.netlify/functions/hello').then(response => response.json())
