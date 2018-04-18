import { action, observable } from "mobx";

class AlertStore {
  @observable alerts = [];
  @observable showLoading = false;

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
  }

}

export default AlertStore;
