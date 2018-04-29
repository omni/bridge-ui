const Page=require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const fieldAmount = By.id("amount");
const buttonTransfer = By.className("bridge-form-button ");
const buttonOk = By.className("swal-button swal-button--confirm");
const fieldsBalance = By.className("network-balance");
const classWeb3Loaded = By.className("web3-loaded");
const classPendingTransaction = By.className("pending-transaction");
const loadingContainer = By.className("loading-container");

class MainPage extends Page {
  constructor(driver){
    super(driver);
    this.url;
    this.fieldHomePOABalance;
    this.fieldForeignPOABalance;
  }

  async initFieldsBalance() {
    if (!(await this.waitUntilWeb3Loaded())) return null;
    try {
      let array;
      array = await super.findWithWait(fieldsBalance);
      this.fieldHomePOABalance = array[0];
      this.fieldForeignPOABalance = array[1];
      return array;
    } catch(err) {
      return null;
    }
 }

  async getHomePOABalance() {
    await this.initFieldsBalance();
    return parseFloat(await  this.fieldHomePOABalance.getText());
  }

  async getForeignPOABalance() {
    await this.initFieldsBalance();
    return parseFloat(await  this.fieldForeignPOABalance.getText());
  }

  async fillFieldAmount(amount) {
    try {
      await this.clickWithWait(fieldAmount);
      await this.fillWithWait(fieldAmount,amount);
      return true;
    } catch (err) {
      return false;
    }
  }

  async clickButtonTransfer() {
    let counter = 10;
    do {
      await this.clickWithWait(buttonTransfer);
      if (counter--<0) return false;
      await this.driver.sleep(1000);
    } while (! await this.isDisplayedLoadingContainer())
    return true;
  }

  async clickButtonOk() {
    return await super.clickWithWait(buttonOk);
  }

  async isPresentButtonOk() {
    return await super.isElementDisplayed(buttonOk,180);
  }

  async waitUntilWeb3Loaded() {
    return await this.waitUntilLocated(classWeb3Loaded,180);
  }

  async isPendingTransaction() {
    return await super.isElementLocated(classPendingTransaction);
  }

  async waitUntilTransactionDone() {
    return await this.waitUntilDisappear(classPendingTransaction,360);
  }

  async waitUntilShowUpButtonOk() {
    return await super.waitUntilDisplayed(buttonOk, 360);
  }

  async waitUntilShowUpLoadingContainer() {
    return await super.waitUntilDisplayed(loadingContainer, 180);
  }

  async isDisplayedLoadingContainer() {
    return await super.isElementDisplayed(loadingContainer);
  }

}
module.exports={
  MainPage:MainPage
};
