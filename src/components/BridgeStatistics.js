import React from 'react'
import numeral from 'numeral'
import { DataBlock } from './DataBlock'

export const BridgeStatistics = ({ gasValue, users, totalBridged, homeBalance, foreignSupply }) => (
  <div className="statistics-bridge-data">
    {/*<DataBlock
      description="Gas Saved"
      value={numeral(gasValue).format('0.0 a')}
      type=''
    />
    <div className="separator" />*/}
    <DataBlock
      description="Users"
      value={numeral(users).format('0,0')}
      type=''
    />
    <div className="separator" />
    <DataBlock
      description="Total POA Bridged"
      value={numeral(totalBridged).format('0,0.00 a', Math.floor)}
      type='POA'
    />
    <div className="separator" />
    <DataBlock
      description="Locked POA in Bridge Contract"
      value={numeral(homeBalance).format('0.00 a', Math.floor)}
      type='POA'
    />
    <div className="separator" />
    <DataBlock
      description="POA20 Tokens Amount"
      value={numeral(foreignSupply).format('0.00 a', Math.floor)}
      type='POA20'
    />
  </div>
);
