import { action, observable } from "mobx";

class ErrorsStore {
  @observable errors = [];
  @observable showLoading = false;

  @action 
  pushError(error){
    console.error("Error: ", error)
    this.errors.push(error)
  }

  remove(value){
    const result = this.errors.remove(value);
    console.log(result, value, this.errors)
  }

  @action
  setLoading(status) {
    this.showLoading = status;
  }

}

export default ErrorsStore;