const key = require('selenium-webdriver').Key;
const page=require('./Page.js');
const Page=page.Page;
const by = require('selenium-webdriver/lib/by');
const By=by.By;
const IDMetaMask="nkbihfbeogaeaoehlefnkodbefgpgknn";
const URL="chrome-extension://"+IDMetaMask+"//popup.html";
const buttonSubmit=By.className("confirm btn-green");
const buttonAccept=By.xpath('//*[@id="app-content"]/div/div[4]/div/button');
const agreement=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div/div/p[1]/strong");
const fieldNewPass=By.xpath("//*[@id=\"password-box\"]");
const fieldConfirmPass=By.xpath("//*[@id=\"password-box-confirm\"]");
const buttonCreate=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/button");
const buttonIveCopied=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/button[1]");
const popupNetwork=By.className("network-name");
const popupAccount=By.xpath("//*[@id=\"app-content\"]/div/div[1]/div/div[2]/span/div");
const fieldPrivateKey=By.xpath("//*[@id=\"private-key-box\"]");
const pass="qwerty12345";
const buttonImport=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[3]/button");
const fieldNewRPCURL=By.id("new_rpc");
const buttonSave=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[3]/div/div[2]/button");
const arrowBackRPCURL=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[1]/i");
const iconChangeAccount=By.className("cursor-pointer color-orange accounts-selector");

var accountOrderNumber=1;
var networks=[0,3,42,4,8545];

class MetaMask extends Page {

  constructor(driver) {
    super(driver);
    this.driver=driver;
    this.URL=URL;
    this.name="Metamask :"
  }

  async clickButtonSubmit() {
    return await super.clickWithWait(buttonSubmit);
  }

  async submitTransaction() {
    await this.clickButtonSubmit();
  }

  async activate() {
    await this.switchToNextPage();
	await this.driver.get(this.URL);
	await super.clickWithWait(buttonAccept);
	let element = await this.driver.findElement(agreement);
	const action=this.driver.actions();
	await action.click(element).perform();
	for (let i=0;i<15;i++) {
      await action.sendKeys(key.TAB).perform();
	}
	await super.clickWithWait(buttonAccept);
	let counter=50;
      do {
	    await this.driver.sleep(1000);
		if (super.waitUntilLocated(fieldNewPass)) break;
		} while(counter-->0);

		if (counter<=0) throw Error("Metamask hasn't downloaded");
		await super.clickWithWait(fieldNewPass);
		await super.fillWithWait(fieldNewPass,pass);
		await super.fillWithWait(fieldConfirmPass,pass);
		await super.clickWithWait(buttonCreate);
		await this.driver.sleep(2000);
		await super.clickWithWait(buttonIveCopied);
		await this.switchToNextPage();
  }

  async importAccount(user) {
    await  super.switchToNextPage();
    await  this.setNetwork(user.networkID);
    await  this.clickImportAccount();
    await  super.fillWithWait(fieldPrivateKey,user.privateKey);
    await  this.driver.sleep(1000);
    await  super.clickWithWait(buttonImport);
    user.accountOrderInMetamask=accountOrderNumber-1;
    await super.switchToNextPage();
  }

  async selectAccount(user) {
    await  this.switchToNextPage();
    await  this.setNetwork(user.networkID);
    await super.clickWithWait(popupAccount);
    await this.driver.executeScript( "document.getElementsByClassName('dropdown-menu-item')["+
	                                  (user.accountOrderInMetamask)+"].click();");
    await this.driver.sleep(1000);
    await this.switchToNextPage();
  }

  async clickImportAccount() {
    await  super.clickWithWait(popupAccount);
    await this.driver.executeScript( "document.getElementsByClassName('dropdown-menu-item')["+(accountOrderNumber+1)+"].click();");
    accountOrderNumber++;
  }

  async doTransaction(refreshCount) {
    await this.switchToNextPage();
    let counter=0;
	let timeLimit=5;
    if (refreshCount !== undefined) timeLimit=refreshCount;
	do {
	  await this.refresh();
	  await super.waitUntilLocated(iconChangeAccount);
      if (await this.isElementDisplayed(buttonSubmit)) {
	    await this.submitTransaction();
        await  this.switchToNextPage();
        return true;
	  }
	  counter++;
	  if (counter>=timeLimit) {
	    await this.switchToNextPage();
	    return false;
	  }
	  await this.driver.sleep(3000);
    } while(true);
  }

  async setNetwork(provider) {
    await super.clickWithWait(popupNetwork);
    let orderNumber=networks.indexOf(provider);
    if (orderNumber<0) await this.addNetwork(provider);
	  else
	  await this.driver.executeScript("document.getElementsByClassName('dropdown-menu-item')["+orderNumber+"].click();");
  }

  async addNetwork(provider) {
    await  this.driver.sleep(1000);//5000
    let url;
    switch(provider) {
      case 77: {
       url="https://sokol.poa.network";
       networks.push(77);
       break;
      }
      case 99: {
        url="https://core.poa.network";
        networks.push(99);
        break;
      }
      case 7762959: {
      	url="https://sokol.poa.network";break;
      } //Musicoin=>SOKOL
      default: {
	      url="https://sokol.poa.network";
      }
    }
    await this.driver.executeScript("document.getElementsByClassName('dropdown-menu-item')["+
	                                 (networks.length-1)+"].click();");
    await this.driver.sleep(3000);
    await super.fillWithWait(fieldNewRPCURL,url);
    await this.driver.sleep(3000);
    await super.clickWithWait(buttonSave);
    await this.driver.sleep(1000);
    await super.clickWithWait(arrowBackRPCURL);
    return true;
  }
}

module.exports = {
  MetaMask:MetaMask
};
