const meta=require('./MetaMask.js');
const MetaMask=meta.MetaMask;

const utils=require('./Utils.js');
const Utils=utils.Utils;
const fs = require('fs-extra');
const page=require('./Page.js');
const Page=page.Page;
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
		   this.accountOrderInMetamask = "undefined";//for MetaMaskPage only
		   this.name = file;
	    }
	        catch (err) {
	           return null;
	        }
	  }

		async sendEther (amount) {
	        let mainPage = new MainPage(this.driver);
			await mainPage.fillFieldAmount(amount);
			await this.driver.sleep(2000);
			await mainPage.clickButtonSend();
			let mtMask = new MetaMask(this.driver);
			await mtMask.doTransaction(7);
			let counter = 20;
			do {
				this.driver.sleep(2000);
				if (counter--<0) return false;

			} while(!(await mainPage.isPresentButtonOk()));

			return await mainPage.clickButtonOk();
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
	    }
	      else {
			await metaMask.selectAccount(this);
		  }
	  }

	  print(){
	      console.log("account:"+this.account);
		  console.log("privateKey:"+this.privateKey);
		  console.log("networkID:"+this.networkID);
	  }


}
module.exports.User=User;
