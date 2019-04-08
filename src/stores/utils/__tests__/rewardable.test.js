import { getFeeToApply, validFee, getFeeAtBlock, calculateValueFee, getRewardableData } from '../rewardable'
import { FEE_MANAGER_MODE } from '../bridgeMode'
import BN from 'bignumber.js'

describe('validFee', () => {
  it('should return true if fee different from zero', () => {
    // Given
    const fee = new BN(0.01)

    // When
    const result = validFee(fee)

    // Then
    expect(result).toBeTruthy()
  })
  it('should return false if fee equals zero', () => {
    // Given
    const fee = new BN(0)

    // When
    const result = validFee(fee)

    // Then
    expect(result).toBeFalsy()
  })
})
describe('getFeeToApply', () => {
  it('should work for ERC_TO_NATIVE bridge mode from home to foreign ', () => {
    // Given
    const homeFeeManager = {
      feeManagerMode: FEE_MANAGER_MODE.BOTH_DIRECTIONS,
      homeFee: new BN(0.01),
      foreignFee: new BN(0.02),
    }

    const foreignFeeManager =  {
      feeManagerMode: FEE_MANAGER_MODE.UNDEFINED,
      homeFee: new BN(0),
      foreignFee: new BN(0),
    }

    const homeToForeignDirection = true

    // When
    const result = getFeeToApply(homeFeeManager, foreignFeeManager, homeToForeignDirection)

    // Then
    expect(validFee(result)).toBeTruthy()
    expect(result).toBe(homeFeeManager.homeFee)
  })
  it('should work for ERC_TO_NATIVE bridge mode from foreign to home', () => {
    // Given
    const homeFeeManager = {
      feeManagerMode: FEE_MANAGER_MODE.BOTH_DIRECTIONS,
      homeFee: new BN(0.01),
      foreignFee: new BN(0.02),
    }

    const foreignFeeManager =  {
      feeManagerMode: FEE_MANAGER_MODE.UNDEFINED,
      homeFee: new BN(0),
      foreignFee: new BN(0),
    }

    const homeToForeignDirection = false

    // When
    const result = getFeeToApply(homeFeeManager, foreignFeeManager, homeToForeignDirection)

    // Then
    expect(validFee(result)).toBeTruthy()
    expect(result).toBe(homeFeeManager.foreignFee)
  })
  it('should work for NATIVE_TO_ERC bridge mode from home to foreign', () => {
    // Given
    const homeFeeManager = {
      feeManagerMode: FEE_MANAGER_MODE.ONE_DIRECTION,
      homeFee: new BN(0),
      foreignFee: new BN(0.02),
    }

    const foreignFeeManager =  {
      feeManagerMode: FEE_MANAGER_MODE.ONE_DIRECTION,
      homeFee: new BN(0.01),
      foreignFee: new BN(0),
    }

    const homeToForeignDirection = true

    // When
    const result = getFeeToApply(homeFeeManager, foreignFeeManager, homeToForeignDirection)

    // Then
    expect(validFee(result)).toBeTruthy()
    expect(result).toBe(foreignFeeManager.homeFee)
  })
  it('should work for NATIVE_TO_ERC bridge mode from foreign to home', () => {
    // Given
    const homeFeeManager = {
      feeManagerMode: FEE_MANAGER_MODE.ONE_DIRECTION,
      homeFee: new BN(0),
      foreignFee: new BN(0.02),
    }

    const foreignFeeManager =  {
      feeManagerMode: FEE_MANAGER_MODE.ONE_DIRECTION,
      homeFee: new BN(0.01),
      foreignFee: new BN(0),
    }

    const homeToForeignDirection = false

    // When
    const result = getFeeToApply(homeFeeManager, foreignFeeManager, homeToForeignDirection)

    // Then
    expect(validFee(result)).toBeTruthy()
    expect(result).toBe(homeFeeManager.foreignFee)
  })
  it('should return no valid fee if no fee manager set from home to foreign', () => {
    // Given
    const homeFeeManager = {
      feeManagerMode: FEE_MANAGER_MODE.UNDEFINED,
      homeFee: new BN(0),
      foreignFee: new BN(0),
    }

    const foreignFeeManager =  {
      feeManagerMode: FEE_MANAGER_MODE.UNDEFINED,
      homeFee: new BN(0),
      foreignFee: new BN(0),
    }

    const homeToForeignDirection = true

    // When
    const result = getFeeToApply(homeFeeManager, foreignFeeManager, homeToForeignDirection)

    // Then
    expect(validFee(result)).toBeFalsy()
  })
  it('should return no valid fee if no fee manager set from home to foreign', () => {
    // Given
    const homeFeeManager = {
      feeManagerMode: FEE_MANAGER_MODE.UNDEFINED,
      homeFee: new BN(0),
      foreignFee: new BN(0),
    }

    const foreignFeeManager =  {
      feeManagerMode: FEE_MANAGER_MODE.UNDEFINED,
      homeFee: new BN(0),
      foreignFee: new BN(0),
    }

    const homeToForeignDirection = false

    // When
    const result = getFeeToApply(homeFeeManager, foreignFeeManager, homeToForeignDirection)

    // Then
    expect(validFee(result)).toBeFalsy()
  })
})
describe('getFeeAtBlock', () => {
  it('should return zero big number if no fee on array', () => {
    // Given
    const feeArray = []
    const blockNumber = 10
    const zeroBN = new BN(0)

    // When
    const result = getFeeAtBlock(feeArray, blockNumber)

    // Then
    expect(result).toEqual(zeroBN)
  })
  it('should return zero big number if block number is minor that first fee', () => {
    // Given
    const feeArray = [
      {
        blockNumber: 12,
        fee: new BN(0.02)
      }
    ]
    const blockNumber = 10
    const zeroBN = new BN(0)

    // When
    const result = getFeeAtBlock(feeArray, blockNumber)

    // Then
    expect(result).toEqual(zeroBN)
  })
  it('should return fee if block number is bigger or equal that first fee', () => {
    // Given
    const feeArray = [
      {
        blockNumber: 12,
        fee: new BN(0.02)
      }
    ]
    const blockNumber = 12
    const biggerBlockNumber = 13

    // When
    const result = getFeeAtBlock(feeArray, blockNumber)
    const biggerBlockNumberResult = getFeeAtBlock(feeArray, biggerBlockNumber)

    // Then
    expect(result).toBe(feeArray[0].fee)
    expect(biggerBlockNumberResult).toBe(feeArray[0].fee)
  })
  it('should return the correct fee', () => {
    // Given
    const feeArray = [
      {
        blockNumber: 12,
        fee: new BN(0.02)
      },
      {
        blockNumber: 20,
        fee: new BN(0.01)
      },
      {
        blockNumber: 50,
        fee: new BN(0.03)
      },
      {
        blockNumber: 75,
        fee: new BN(0.04)
      }
    ]

    const blockNumber1 = 15
    const blockNumber2 = 31
    const blockNumber3 = 57
    const blockNumber4 = 94

    // When
    const result1 = getFeeAtBlock(feeArray, blockNumber1)
    const result2 = getFeeAtBlock(feeArray, blockNumber2)
    const result3 = getFeeAtBlock(feeArray, blockNumber3)
    const result4 = getFeeAtBlock(feeArray, blockNumber4)

    // Then
    expect(result1).toBe(feeArray[0].fee)
    expect(result2).toBe(feeArray[1].fee)
    expect(result3).toBe(feeArray[2].fee)
    expect(result4).toBe(feeArray[3].fee)
  })
})
describe('calculateValueFee', () => {
  it('should return a method', () => {
    // Given
    const feeArray = [
      {
        blockNumber: 10,
        fee: new BN(0.01)
      }
    ]
    const feeCollected = {
      value: new BN(0)
    }
    const feeApplied = false

    // When
    const calculateFeeMethod = calculateValueFee(feeArray, feeCollected, feeApplied)

    // Then
    expect(calculateFeeMethod).toBeInstanceOf(Function)
  })
  it('should return a method that calculate and accumulate fee values', () => {
    // Given
    const feeArray = [
      {
        blockNumber: 10,
        fee: new BN(0.01)
      },
      {
        blockNumber: 20,
        fee: new BN(0.02)
      }
    ]
    const feeCollected = {
      value: new BN(0)
    }
    const feeApplied = false
    const events = [
      {
        value: new BN(10),
        blockNumber: 15
      },
      {
        value: new BN(10),
        blockNumber: 18
      },
      {
        value: new BN(15),
        blockNumber: 26
      },
      {
        value: new BN(25),
        blockNumber: 42
      }
    ]
    const collectedFees = new BN(1)

    // When
    const calculateFeeMethod = calculateValueFee(feeArray, feeCollected, feeApplied)
    events.forEach(calculateFeeMethod)

    // Then
    expect(feeCollected.value).toEqual(collectedFees)
  })
  it('should calculate correctly fee when fee already applied on event value', () => {
    // Given
    const feeArray = [
      {
        blockNumber: 10,
        fee: new BN(0.01)
      },
      {
        blockNumber: 20,
        fee: new BN(0.02)
      }
    ]
    const feeCollected = {
      value: new BN(0)
    }
    const feeApplied = true
    const events = [
      {
        value: new BN(9.9),
        blockNumber: 15
      },
      {
        value: new BN(9.9),
        blockNumber: 18
      },
      {
        value: new BN(14.7),
        blockNumber: 26
      },
      {
        value: new BN(24.5),
        blockNumber: 42
      }
    ]
    const collectedFees = new BN(1)

    // When
    const calculateFeeMethod = calculateValueFee(feeArray, feeCollected, feeApplied)
    events.forEach(calculateFeeMethod)

    // Then
    expect(feeCollected.value).toEqual(collectedFees)
  })
})
describe('getRewardableData', () => {
  it('should return correct data for BOTH_DIRECTIONS on home', () => {
    // Given
    const homeFeeManager = {
      feeManagerMode: FEE_MANAGER_MODE.BOTH_DIRECTIONS,
      homeFee: new BN(0.01),
      foreignFee: new BN(0.02),
      homeHistoricFee: [{ blockNumber: 10, fee: new BN(0.01) }],
      foreignHistoricFee: [{ blockNumber: 10, fee: new BN(0.02) }]
    }

    const foreignFeeManager =  {
      feeManagerMode: FEE_MANAGER_MODE.UNDEFINED,
      homeFee: new BN(0),
      foreignFee: new BN(0),
      homeHistoricFee: [],
      foreignHistoricFee: []
    }


    // When
    const result = getRewardableData(homeFeeManager, foreignFeeManager)

    // Then
    expect(result.homeFee).toBe(homeFeeManager.homeFee)
    expect(result.foreignFee).toBe(homeFeeManager.foreignFee)
    expect(result.homeHistoricFee).toEqual(homeFeeManager.homeHistoricFee)
    expect(result.foreignHistoricFee).toEqual(homeFeeManager.foreignHistoricFee)
    expect(result.depositSymbol).toBe('home')
    expect(result.withdrawSymbol).toBe('home')
    expect(result.displayDeposit).toBe(true)
    expect(result.displayWithdraw).toBe(true)
  })
  it('should return correct data for ONE_DIRECTION on home and ONE_DIRECTION on foreign', () => {
    // Given
    const homeFeeManager = {
      feeManagerMode: FEE_MANAGER_MODE.ONE_DIRECTION,
      homeFee: new BN(0),
      foreignFee: new BN(0.02),
      homeHistoricFee: [],
      foreignHistoricFee: [{ blockNumber: 10, fee: new BN(0.02) }]
    }

    const foreignFeeManager =  {
      feeManagerMode: FEE_MANAGER_MODE.ONE_DIRECTION,
      homeFee: new BN(0.01),
      foreignFee: new BN(0),
      homeHistoricFee: [{ blockNumber: 10, fee: new BN(0.01) }],
      foreignHistoricFee: []
    }


    // When
    const result = getRewardableData(homeFeeManager, foreignFeeManager)

    // Then
    expect(result.homeFee).toBe(foreignFeeManager.homeFee)
    expect(result.foreignFee).toBe(homeFeeManager.foreignFee)
    expect(result.homeHistoricFee).toEqual(foreignFeeManager.homeHistoricFee)
    expect(result.foreignHistoricFee).toEqual(homeFeeManager.foreignHistoricFee)
    expect(result.depositSymbol).toBe('foreign')
    expect(result.withdrawSymbol).toBe('home')
    expect(result.displayDeposit).toBe(true)
    expect(result.displayWithdraw).toBe(true)
  })
  it('should return correct data for ONE_DIRECTION on home and UNDEFINED on foreign', () => {
    // Given
    const homeFeeManager = {
      feeManagerMode: FEE_MANAGER_MODE.ONE_DIRECTION,
      homeFee: new BN(0),
      foreignFee: new BN(0.02),
      homeHistoricFee: [],
      foreignHistoricFee: [{ blockNumber: 10, fee: new BN(0.02) }]
    }

    const foreignFeeManager =  {
      feeManagerMode: FEE_MANAGER_MODE.UNDEFINED,
      homeFee: new BN(0),
      foreignFee: new BN(0),
      homeHistoricFee: [],
      foreignHistoricFee: []
    }

    const zeroBN = new BN(0)
    const emptyArray = []

    // When
    const result = getRewardableData(homeFeeManager, foreignFeeManager)

    // Then
    expect(result.homeFee).toEqual(zeroBN)
    expect(result.foreignFee).toBe(homeFeeManager.foreignFee)
    expect(result.homeHistoricFee).toEqual(emptyArray)
    expect(result.foreignHistoricFee).toEqual(homeFeeManager.foreignHistoricFee)
    expect(result.depositSymbol).toBe('')
    expect(result.withdrawSymbol).toBe('home')
    expect(result.displayDeposit).toBe(false)
    expect(result.displayWithdraw).toBe(true)
  })
  it('should return correct data for UNDEFINED on home and ONE_DIRECTION on foreign', () => {
    // Given
    const homeFeeManager = {
      feeManagerMode: FEE_MANAGER_MODE.UNDEFINED,
      homeFee: new BN(0),
      foreignFee: new BN(0),
      homeHistoricFee: [],
      foreignHistoricFee: []
    }

    const foreignFeeManager =  {
      feeManagerMode: FEE_MANAGER_MODE.ONE_DIRECTION,
      homeFee: new BN(0.01),
      foreignFee: new BN(0),
      homeHistoricFee: [{ blockNumber: 10, fee: new BN(0.01) }],
      foreignHistoricFee: []
    }

    const zeroBN = new BN(0)
    const emptyArray = []

    // When
    const result = getRewardableData(homeFeeManager, foreignFeeManager)

    // Then
    expect(result.homeFee).toBe(foreignFeeManager.homeFee)
    expect(result.foreignFee).toEqual(zeroBN)
    expect(result.homeHistoricFee).toEqual(foreignFeeManager.homeHistoricFee)
    expect(result.foreignHistoricFee).toEqual(emptyArray)
    expect(result.depositSymbol).toBe('foreign')
    expect(result.withdrawSymbol).toBe('')
    expect(result.displayDeposit).toBe(true)
    expect(result.displayWithdraw).toBe(false)
  })
})