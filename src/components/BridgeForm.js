import React from 'react'

export const BridgeForm = ({ reverse, currency, onTransfer, onInputChange, displayArrow}) => (
  <div className={`form-container ${displayArrow ? 'transfer-right' : ''}` }>
    <form className="bridge-form">
      <div className="bridge-form-controls">
        <div className="bridge-form-input-container">
          <input onChange={onInputChange} name='amount' type="text" className="bridge-form-input" id="amount" placeholder="0.345" />
          <label htmlFor="amount" className="bridge-form-label">{currency}</label>
        </div>
        <div>
          <button onClick={onTransfer} type="button" className="bridge-form-button">Transfer</button>
        </div>
      </div>
    </form>
  </div>
)
