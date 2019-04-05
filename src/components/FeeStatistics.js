import React from 'react'
import numeral from 'numeral'
import { DataBlock } from './DataBlock'

export const FeeStatistics = ({ depositFeeCollected, withdrawFeeCollected }) => (
  <div className="statistics-fee-data">
    {
      depositFeeCollected.shouldDisplay &&
      <DataBlock
        description="Deposit Fees"
        value={numeral(depositFeeCollected.value).format('0,0.00 a', Math.floor)}
        type={depositFeeCollected.type}
      />
    }
    {
      depositFeeCollected.shouldDisplay &&
      withdrawFeeCollected.shouldDisplay &&
      <div className="separator" />
    }
    {
      withdrawFeeCollected.shouldDisplay &&
      <DataBlock
        description="Withdrawal Fees"
        value={numeral(withdrawFeeCollected.value).format('0,0.00 a', Math.floor)}
        type={withdrawFeeCollected.type}
      />
    }
  </div>
)