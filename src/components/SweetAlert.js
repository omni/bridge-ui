import React from 'react';
import swal from 'sweetalert';
import { inject, observer } from "mobx-react";

@inject("RootStore")
@observer
export class SweetAlert extends React.Component {
  constructor(props){
    super(props)
    this.errorsStore = props.RootStore.errorsStore;
  }
  componentWillReact(){
    if(this.errorsStore.errors.length > 0){
      const error = this.errorsStore.errors.slice()[0]
      swal(error.label, error.message, error.type).then(() => {
        this.errorsStore.remove(error)
      })
    }
  }
  render(){
    console.log('Found errors:', this.errorsStore.errors.length)
    return (
      <div style={{display: 'none'}}></div>
    )
  }
}
