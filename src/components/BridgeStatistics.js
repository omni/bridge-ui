import React from 'react'
import numeral from 'numeral'
import { DataBlock } from './DataBlock'

export const BridgeStatistics = ({ gasValue, users, totalBridged, homeBalance, foreignSupply, homeSymbol, foreignSymbol }) => (
  <div className="statistics-bridge-data">
    <DataBlock
      description="Users"
      value={numeral(users).format('0,0')}
      type=''
    />
    <div className="separator" />
    <DataBlock
      description={`Total ${homeSymbol} Bridged`}
      value={numeral(totalBridged).format('0,0.00 a', Math.floor)}
      type={homeSymbol}
    />
    <div className="separator" />
    <DataBlock
      description={`Locked ${homeSymbol} in Bridge Contract`}
      value={numeral(homeBalance).format('0.00 a', Math.floor)}
      type={homeSymbol}
    />
    <div className="separator" />
    <DataBlock
      description={`${foreignSymbol} Tokens Amount`}
      value={numeral(foreignSupply).format('0.00 a', Math.floor)}
      type={foreignSymbol}
    />
  </div>
);
