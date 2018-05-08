import React from 'react'
import pic1 from '../assets/images/pic-1.svg'
import pic2 from '../assets/images/pic-2.svg'
import pic3 from '../assets/images/pic-3.svg'

const logos = [
  pic1,
  pic2,
  pic3
]

export const Authority = ({ address, number, logoIndex }) => (
  <div className="authority">
    <span className='authority-number'>{number}</span>
    <div className="separator" />
    <img className='authority-logo' src={logos[logoIndex]} alt=""/>
    <span className='authority-address'>{address}</span>
  </div>
);
