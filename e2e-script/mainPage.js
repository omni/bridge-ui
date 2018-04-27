const utils=require('./Utils.js');
const Utils=utils.Utils;
const page=require('./Page.js');
const Page=page.Page;
const by = require('selenium-webdriver/lib/by');
const By=by.By;
const fieldAmount = By.id("amount");
const buttonTransfer = By.className("bridge-form-button ");
const buttonOk = By.className("swal-button swal-button--confirm");
const fieldsBalance = By.className("network-balance");
const classWeb3Loaded = By.className("web3-loaded");
const classPendingTransaction = By.className("pending-transaction");
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
      await super.fillWithWait(fieldAmount,amount);
	  return true;
	} catch (err) {
	  return false;
	}
  }

  async clickButtonTransfer() {
    return await super.clickWithWait(buttonTransfer);
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
    let counter = 60;
	do {
      await this.driver.sleep(500);
      if (counter--<0) return false;
	} while(await this.isPendingTransaction());
	return true;
  }

  async waitUntilButtonOkPresent() {
    return await super.waitUntilDisplayed(buttonOk, 180);
  }

}
module.exports={
  MainPage:MainPage
};
