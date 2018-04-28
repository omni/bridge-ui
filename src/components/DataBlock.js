import React from 'react'

export const DataBlock = ({ description, value, type}) => (
  <div className="datablock-container">
    <p>
      <span className="datablock-value">{value}</span>
      <span className={ type ? "datablock-type" : ""}>{type}</span>
    </p>
    <p className="datablock-description">{description}</p>
  </div>
);
