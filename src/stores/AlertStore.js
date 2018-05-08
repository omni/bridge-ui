import { action, observable } from "mobx";

class AlertStore {
  @observable alerts = [];
  @observable showLoading = false;
  @observable loadingStepIndex = -1;
  @observable blockConfirmations = 0
  loadingSteps = [
    'Loading',
    'Waiting for Block Confirmations...',
    'Getting Required Signatures from Validators...',
    'Transfer Complete'
  ];

  @action 
  pushError(message){
    console.error("Error: ", message)
    const error = {label: "Error", message, type: "error"}
    this.alerts.push(error)
  }

  @action
  pushSuccess(message){
    const success = {label: "Success", message, type: "success"}
    this.alerts.push(success)
  }

  remove(value){
    const result = this.alerts.remove(value);
    console.log(result, value, this.alerts)
  }

  @action
  setLoading(status) {
    this.showLoading = status;
    this.loadingStepIndex = 0;
    this.blockConfirmations = 0
  }

  @action
  setBlockConfirmations(blocks) {
    this.blockConfirmations = blocks
  }

  @action
  setLoadingStepIndex(index) {
    this.loadingStepIndex = index;
    console.log(this.loadingSteps[index])
    if(index === this.loadingSteps.length - 1) {
      setTimeout(() => { this.setLoading(false)}, 2000)
    }
  }

  shouldDisplayLoadingSteps() {
    return this.loadingStepIndex !== -1
  }

}

export default AlertStore;
