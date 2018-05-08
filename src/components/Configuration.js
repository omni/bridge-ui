import React from 'react'
import numeral from 'numeral'
import { DataBlock } from './DataBlock'

export const Configuration = ({ requiredSignatures, authorities, estGasCost, maxSingleDeposit, maxTotalBalance }) => (
  <div className="status-configuration-data">
    <DataBlock
      description="Required Signatures"
      value={numeral(requiredSignatures).format('0')}
      type=''
    />
    <div className="separator" />
    <DataBlock
      description="Authorities"
      value={numeral(authorities).format('0')}
      type=''
    />
    <div className="separator" />
    {/*<DataBlock
      description="Est. GAS Cost"
      value={numeral(estGasCost).format('0.00 a', Math.floor)}
      type=''
    />
    <div className="separator" />*/}
    <DataBlock
      description="Max Single Deposit"
      value={numeral(maxSingleDeposit).format('0.00 a', Math.floor)}
      type='POA'
    />
    <div className="separator" />
    <DataBlock
      description="Max Total Balance"
      value={numeral(maxTotalBalance).format('0.00 a', Math.floor)}
      type='POA'
    />
  </div>
);
