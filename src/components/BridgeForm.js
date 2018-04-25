import React from 'react'

export const BridgeForm = ({ reverse, currency, from, to, onTransfer, onInputChange}) => (
  <div className="form-container">
    <form className="bridge-form">
      <div>
        <p className="bridge-transfer-direction">{from} - {to}</p>
      </div>
      <div className="bridge-form-controls">
        <input onChange={onInputChange} name='amount' type="text" className="bridge-form-input" id="amount" placeholder="0.345" />
        <label htmlFor="amount" className="bridge-form-label">{currency}</label>
        <button onClick={onTransfer} type="button" className="bridge-form-button">Transfer</button>
      </div>
    </form>
  </div>
)
