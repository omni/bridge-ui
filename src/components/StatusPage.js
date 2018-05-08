import React from 'react'
import { inject, observer } from "mobx-react"

@inject("RootStore")
@observer
export class StatusPage extends React.Component {

  render() {
    return (
      <div className="status-page">
        <div className='status-left-container'>left</div>
        <div className='status-page-container'>container</div>
        <div className='status-right-container'>right</div>
      </div>
    )
  }
}
