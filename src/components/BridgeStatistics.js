import React from 'react'
import numeral from 'numeral'
import { DataBlock } from './DataBlock'

export const BridgeStatistics = ({ gasValue, users, totalBridged, homeBalance, foreignSupply }) => (
  <div className="bridge-statistics">
    <DataBlock
      description="Gas Saved"
      value={numeral(gasValue).format('0.0 a')}
      type=''
    />
    <div className="separator" />
    <DataBlock
      description="Users"
      value={numeral(users).format('0,0')}
      type=''
    />
    <div className="separator" />
    <DataBlock
      description="Total POA Bridged"
      value={numeral(totalBridged).format('0.00')}
      type='POA'
    />
    <div className="separator" />
    <DataBlock
      description="Home Balance"
      value={numeral(homeBalance).format('0.00')}
      type='POA'
    />
    <div className="separator" />
    <DataBlock
      description="Foreign Total Supply"
      value={numeral(foreignSupply).format('0.00')}
      type='POA'
    />
  </div>
);
