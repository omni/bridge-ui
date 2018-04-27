const meta=require('./MetaMask.js');
const MetaMask=meta.MetaMask;
const utils=require('./Utils.js');
const Utils=utils.Utils;
const fs = require('fs-extra');
const mnPage=require('./mainPage.js');
const MainPage=mnPage.MainPage;

class User {
  constructor(driver,file){
    try {
      this.driver = driver;
	  let obj = JSON.parse(fs.readFileSync(file, "utf8"));
	  this.account = obj.account;
	  this.privateKey = obj.privateKey;
	  this.networkID = obj.networkID;
	  this.accountOrderInMetamask = "undefined";//for MetaMaskPage usage only
	  this.name = file;
	} catch (err) {
	  console.log("instance User was not created");
	  console.log(err);
	}
  }

  async transferTokens (amount) {
    let mainPage = new MainPage(this.driver);
	let mtMask = new MetaMask(this.driver);
	return (
	  await mainPage.fillFieldAmount(amount) &&
	  await mainPage.clickButtonTransfer() &&
	  await mtMask.doTransaction() &&
	  await mainPage.waitUntilButtonOkPresent() &&
	  await mainPage.clickButtonOk() &&
	  await mainPage.waitUntilTransactionDone() &&
	  await mainPage.waitUntilButtonOkPresent() &&
	  await mainPage.clickButtonOk()
    );
  }

  async setMetaMaskNetwork() {
    let metaMask = new MetaMask(this.driver);
	await  metaMask.switchToNextPage();
	await metaMask.setNetwork(this.networkID);
	await  metaMask.switchToNextPage();
  }

  async setMetaMaskAccount() {
    let metaMask = new MetaMask(this.driver);
    if (this.accountOrderInMetamask === "undefined") {
	   await metaMask.importAccount(this);
	} else {
	  await metaMask.selectAccount(this);
	}
  }
}

module.exports = {
  User:User
};