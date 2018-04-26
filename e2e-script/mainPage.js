const utils=require('./Utils.js');
const Utils=utils.Utils;
const page=require('./Page.js');
const Page=page.Page;
const by = require('selenium-webdriver/lib/by');
const By=by.By;

const fieldAmount = By.id("amount");
const buttonSend = By.className("bridge-form-button ");
const buttonOk = By.className("swal-button swal-button--confirm");
const fieldsDescription = By.className("description break-all");

class MainPage extends Page {

	constructor(driver){
		super(driver);
		this.url;
		this.fieldHomePOABalance;
		this.fieldForeignPOABalance;
	}

	async initFields() {
		await this.driver.sleep(500);
		try {
		const locator = fieldsDescription;
		let array;
		let counter = 60
		do {
			array = await super.findWithWait(locator);

		}
		while (array.length<13);
		this.fieldHomePOABalance = array[5];
		this.fieldForeignPOABalance = array[12];
        return array;
		}
		catch(err) {
			return null;
		}
	}

	async getHomePOABalance() {
		let result;
		do {
			await this.initFields();
			result = parseFloat(await  this.fieldHomePOABalance.getText());
		}
		while(isNaN(result));
		return  result;

	}

	async getForeignPOABalance() {

		let result;
		do {
			await this.initFields();
			result = parseFloat(await  this.fieldForeignPOABalance.getText());
		}
		while(isNaN(result));
		return  result;
	}

	async fillFieldAmount(amount){
		try{

			//await super.clearField(fieldAmount);
			await super.fillWithWait(fieldAmount,amount);
			return true;
		}
		catch (err) {
			return false;
		}
	}

	async clickButtonSend(){

		return await super.clickWithWait(buttonSend);

	}
	async clickButtonOk(){

		return await super.clickWithWait(buttonOk);

	}

	async isPresentButtonOk() {

		return await super.waitUntilLocated(buttonOk);
	}



}
module.exports={
	MainPage:MainPage


}
