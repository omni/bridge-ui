import React from 'react'
import numeral from 'numeral'
import { DataBlock } from './DataBlock'

export const TransactionsStatistics = ({ txNumber, value }) => (
  <div className="statistics-bridge-data">
    <DataBlock
      description="Transactions"
      value={numeral(txNumber).format('0 a')}
      type=''
    />
    <div className="separator" />
    <DataBlock
      description="Total Value"
      value={numeral(value).format('0.000', Math.floor)}
      type='POA'
    />
  </div>
)
