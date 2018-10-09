import Web3Utils from 'web3-utils'
import BN from 'bignumber.js';

export const getMaxPerTxLimit = async (contract) => {
  const maxPerTx = await contract.methods.maxPerTx().call()
  return Web3Utils.fromWei(maxPerTx)
}

export const getMinPerTxLimit = async (contract) => {
  const minPerTx = await contract.methods.minPerTx().call()
  return Web3Utils.fromWei(minPerTx)
}

export const getCurrentLimit = async (contract) => {
  const currentDay = await contract.methods.getCurrentDay().call()
  const dailyLimit = await contract.methods.dailyLimit().call()
  const totalSpentPerDay = await contract.methods.totalSpentPerDay(currentDay).call()
  const maxCurrentDeposit = new BN(dailyLimit).minus(new BN(totalSpentPerDay)).toString(10)
  return {
    maxCurrentDeposit: Web3Utils.fromWei(maxCurrentDeposit),
    dailyLimit: Web3Utils.fromWei(dailyLimit),
    totalSpentPerDay: Web3Utils.fromWei(totalSpentPerDay)
  }
}

export const getPastEvents = (contract, fromBlock, toBlock) => contract.getPastEvents({ fromBlock, toBlock })

export const getErc677TokenAddress = (contract) => contract.methods.erc677token().call()

export const getErc20TokenAddress = (contract) => contract.methods.erc20token().call()

export const getSymbol = (contract) => contract.methods.symbol().call()

export const getMessage = (contract, messageHash) => contract.methods.message(messageHash).call()

export const getTotalSupply = async (contract) => {
  const totalSupply = await contract.methods.totalSupply().call()
  return Web3Utils.fromWei(totalSupply)
}

export const getBalanceOf = async (contract, address) => {
  const balance = await contract.methods.balanceOf(address).call()
  return Web3Utils.fromWei(balance)
}

export const mintedTotally = async (contract) => {
  const mintedCoins = await contract.methods.mintedTotally().call()
  return new BN(mintedCoins)
}

export const totalBurntCoins = async (contract) => {
  const burntCoins = await contract.methods.totalBurntCoins().call()
  return new BN(burntCoins)
}

export const getBridgeValidators = async (bridgeValidatorContract) => {
  let ValidatorAdded = await bridgeValidatorContract.getPastEvents('ValidatorAdded', {fromBlock: 0});
  let ValidatorRemoved = await bridgeValidatorContract.getPastEvents('ValidatorRemoved', {fromBlock: 0});
  let addedValidators = ValidatorAdded.map(val => {
    return val.returnValues.validator
  })
  const removedValidators = ValidatorRemoved.map(val => {
    return val.returnValues.validator
  })
  return addedValidators.filter(val => !removedValidators.includes(val));
}
