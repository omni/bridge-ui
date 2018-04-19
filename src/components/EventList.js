import React from 'react';

export const EventList = ({ events, description, handleChange, handleKeyDown }) => (
  <div>
    <h1 className="events-title events-title_mobile">{description}</h1>
    <input type="text" onChange={handleChange} onKeyDown={handleKeyDown} className="events-side-input" placeholder="Tx Hash or Block Number..." />
    {events}
  </div>
)
