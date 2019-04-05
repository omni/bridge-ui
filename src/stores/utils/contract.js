import BN from 'bignumber.js';
import { fromDecimals } from './decimals'
import { fromWei } from 'web3-utils'
import { FEE_MANAGER_MODE } from './bridgeMode'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const validFee = (fee) => {
  const zeroBN = new BN(0)
  return !zeroBN.eq(fee)
}

export const getMaxPerTxLimit = async (contract,decimals) => {
  const maxPerTx = await contract.methods.maxPerTx().call()
  return fromDecimals(maxPerTx,decimals)
}

export const getMinPerTxLimit = async (contract,decimals) => {
  const minPerTx = await contract.methods.minPerTx().call()
  return fromDecimals(minPerTx,decimals)
}

export const getCurrentLimit = async (contract,decimals) => {
  const currentDay = await contract.methods.getCurrentDay().call()
  const dailyLimit = await contract.methods.dailyLimit().call()
  const totalSpentPerDay = await contract.methods.totalSpentPerDay(currentDay).call()
  const maxCurrentDeposit = new BN(dailyLimit).minus(new BN(totalSpentPerDay)).toString(10)
  return {
    maxCurrentDeposit: fromDecimals(maxCurrentDeposit,decimals),
    dailyLimit: fromDecimals(dailyLimit,decimals),
    totalSpentPerDay: fromDecimals(totalSpentPerDay,decimals)
  }
}

export const getPastEvents = (contract, fromBlock, toBlock, event = 'allEvents') => contract.getPastEvents(event, { fromBlock, toBlock })

export const getErc677TokenAddress = (contract) => contract.methods.erc677token().call()

export const getErc20TokenAddress = (contract) => contract.methods.erc20token().call()

export const getSymbol = (contract) => contract.methods.symbol().call()

export const getDecimals= (contract) => contract.methods.decimals().call()

export const getMessage = (contract, messageHash) => contract.methods.message(messageHash).call()

export const getTotalSupply = async (contract) => {
  const totalSupply = await contract.methods.totalSupply().call()
  const decimals = await contract.methods.decimals().call()
  return fromDecimals(totalSupply,decimals)
}

export const getBalanceOf = async (contract, address) => {
  const balance = await contract.methods.balanceOf(address).call()
  const decimals = await contract.methods.decimals().call()
  return fromDecimals(balance,decimals)
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

export const getName = (contract) => contract.methods.name().call()

export const getFeeManager = async (contract) => {
 try {
   return await contract.methods.feeManagerContract().call()
 } catch (e) {
   return ZERO_ADDRESS
 }
}

export const getFeeManagerMode = (contract) => contract.methods.getFeeManagerMode().call()

export const getHomeFee = async (contract) => {
  const feeInWei = await contract.methods.getHomeFee().call()
  return new BN(fromWei(feeInWei.toString()))
}

export const getForeignFee = async (contract) => {
  const feeInWei = await contract.methods.getForeignFee().call()
  return new BN(fromWei(feeInWei.toString()))
}

export const getFeeToApply = (homeFeeManager, foreignFeeManager, homeToForeignDirection) => {
  const data = getRewardableData(homeFeeManager, foreignFeeManager)
  return homeToForeignDirection ? data.homeFee : data.foreignFee
}

export const getRewardableData = (homeFeeManager, foreignFeeManager) => {
  if(homeFeeManager.feeManagerMode === FEE_MANAGER_MODE.BOTH_DIRECTIONS) {
    return {
      homeFee: homeFeeManager.homeFee,
      foreignFee: homeFeeManager.foreignFee,
      homeHistoricFee: homeFeeManager.homeHistoricFee,
      foreignHistoricFee: homeFeeManager.foreignHistoricFee,
      depositSymbol: 'home',
      withdrawSymbol: 'home',
      displayDeposit: true,
      displayWithdraw: true
    }
  } else if(homeFeeManager.feeManagerMode === FEE_MANAGER_MODE.ONE_DIRECTION
    && foreignFeeManager.feeManagerMode === FEE_MANAGER_MODE.ONE_DIRECTION) {
    return {
      homeFee: foreignFeeManager.homeFee,
      foreignFee: homeFeeManager.foreignFee,
      homeHistoricFee: foreignFeeManager.homeHistoricFee,
      foreignHistoricFee: homeFeeManager.foreignHistoricFee,
      depositSymbol: 'foreign',
      withdrawSymbol: 'home',
      displayDeposit: true,
      displayWithdraw: true
    }
  } else if(homeFeeManager.feeManagerMode === FEE_MANAGER_MODE.ONE_DIRECTION
    && foreignFeeManager.feeManagerMode === FEE_MANAGER_MODE.UNDEFINED) {
    return {
      homeFee: new BN(0),
      foreignFee: homeFeeManager.foreignFee,
      homeHistoricFee: [],
      foreignHistoricFee: homeFeeManager.foreignHistoricFee,
      depositSymbol: '',
      withdrawSymbol: 'home',
      displayDeposit: false,
      displayWithdraw: true
    }
  } else if(homeFeeManager.feeManagerMode === FEE_MANAGER_MODE.UNDEFINED
    && foreignFeeManager.feeManagerMode === FEE_MANAGER_MODE.ONE_DIRECTION) {
    return {
      homeFee: foreignFeeManager.homeFee,
      foreignFee: new BN(0),
      homeHistoricFee: foreignFeeManager.homeHistoricFee,
      foreignHistoricFee: [],
      depositSymbol: 'foreign',
      withdrawSymbol: '',
      displayDeposit: true,
      displayWithdraw: false
    }
  } else {
    return {
      homeFee: new BN(0),
      foreignFee: new BN(0),
      depositSymbol: '',
      withdrawSymbol: '',
      displayDeposit: false,
      displayWithdraw: false
    }
  }
}

export const getFeeEvents = async (contract, eventName) => {
  const events = await getPastEvents(contract, 0, 'latest', eventName)
  return events.map(processFeeEvent)
}

const processFeeEvent = (event) => {
  return {
    blockNumber: event.blockNumber,
    fee: new BN(fromWei(event.returnValues.fee))
  }
}

export const getFeeAtBlock = (feeArray, blockNumber) => {
  for (let i = feeArray.length - 1; i >= 0; i--) {
    if (blockNumber > feeArray[i].blockNumber) {
      return feeArray[i].fee
    }
  }
  return new BN(0)
}
