import React from 'react'
import pic1 from '../assets/images/pic-1.svg'
import pic2 from '../assets/images/pic-2.svg'
import pic3 from '../assets/images/pic-3.svg'

export const Authority = ({ address, number, logo }) => (
  <div className="authority">
    <span>{number}</span>
    <div className="separator" />
    <img src="" alt=""/>
    <span></span>
    {address} {logo}
  </div>
);
