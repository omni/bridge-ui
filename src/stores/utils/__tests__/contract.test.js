import { getFeeToApply, validFee } from '../contract'
import { FEE_MANAGER_MODE } from '../bridgeMode'
import BN from 'bignumber.js'

describe('getFeeToApply', function () {
  it('should work for ERC_TO_NATIVE bridge mode from home to foreign ', async () => {
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
  it('should work for ERC_TO_NATIVE bridge mode from foreign to home', async () => {
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
  it('should work for NATIVE_TO_ERC bridge mode from home to foreign', async () => {
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
  it('should work for NATIVE_TO_ERC bridge mode from foreign to home', async () => {
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
  it('should return no valid fee if no fee manager set from home to foreign', async () => {
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
  it('should return no valid fee if no fee manager set from home to foreign', async () => {
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
