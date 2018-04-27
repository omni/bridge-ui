let test = require('selenium-webdriver/testing');
let assert = require('assert');
const fs = require('fs-extra');
const utils=require('./Utils.js');
const Utils=utils.Utils;
const mtMask=require('./MetaMask.js');
const MetaMask=mtMask.MetaMask;
const mnPage=require('./mainPage.js');
const MainPage=mnPage.MainPage;
const user=require("./User.js");
const User=user.User;

test.describe('e2e-test for bridge-ui, version 1.0.1',  async function() {
	this.timeout(4*60000);
	this.slow(1*60000);

	const maxAmountPerTransactionLimit = 0.1;
	let startUrl;
	let driver;
	let mainPage;
	let homeAccount;
	let foreignAccount;
	let metaMask;
	let foreignBalanceBefore;
	let homeBalanceBefore;

	test.before( async function() {
		driver = await Utils.startBrowserWithMetamask();
		mainPage = new MainPage(driver);
		homeAccount = new User (driver,await Utils.getHomeAccount());
		foreignAccount = new User (driver,await Utils.getForeignAccount());
		metaMask = new MetaMask(driver);
		await metaMask.activate();
		await foreignAccount.setMetaMaskAccount();
	});

	test.after(async function() {
		await driver.quit();
	});

	test.it('User is able to open main page of bridge-ui  ',
		async function () {
			startUrl=await Utils.getStartURL();
			let result = await  mainPage.open(startUrl);
			return await assert.equal(result, startUrl, "Test FAILED. User is not able to open bridge-ui main page");
	});

	test.it('Main page: foreign POA balance is displayed ',
		async function () {
			foreignBalanceBefore =  await mainPage.getForeignPOABalance();
			let result = foreignBalanceBefore>=0;
			return await assert.equal(result,true, "Test FAILED.Foreign POA balance is not displayed ");
	});

	test.it('Main page: home POA balance is displayed ',
		async function () {
			await homeAccount.setMetaMaskNetwork();
			homeBalanceBefore =  await mainPage.getHomePOABalance();
			let result = foreignBalanceBefore>=0;
			return await assert.equal(result,true,"Test FAILED.Home POA balance is not displayed ");
	});

	test.it('User is able to send tokens from Home account to Foreign account ',
		async function () {
			let result = await homeAccount.transferTokens(maxAmountPerTransactionLimit);
			return await assert.equal(result, true, "Test FAILED. User is able send tokens from Home account to Foreign account");
	});

	test.it('Home POA balance has correctly changed after transaction' ,
		async function () {
			let newHomeBalance =  await mainPage.getHomePOABalance();
			let shouldBe = homeBalanceBefore-maxAmountPerTransactionLimit;
			let result = (Math.abs(shouldBe-newHomeBalance))<(maxAmountPerTransactionLimit/100);
			homeBalanceBefore = newHomeBalance;
			return await assert.equal(result,true,"Test FAILED.Home POA balance is not correct after transaction");
	});

	test.it('Foreign account has received correct amount of tokens after transaction ',
		async function () {
			await foreignAccount.setMetaMaskNetwork();
			let newForeignBalance =  await mainPage.getForeignPOABalance();
			let shouldBe = foreignBalanceBefore+maxAmountPerTransactionLimit;
			let result = (Math.abs(shouldBe-newForeignBalance))<(maxAmountPerTransactionLimit/100);
			return await assert.equal(result, true, "Test FAILED. Foreign POA balance is not correct after transaction");
	});


	test.it('User is able to send tokens from Foreign account to Home account ',
		async function () {
			foreignBalanceBefore =  await mainPage.getForeignPOABalance();
			let result = await foreignAccount.transferTokens(maxAmountPerTransactionLimit);
			return await assert.equal(result, true, "Test FAILED. User is able send tokens from Home account to Foreign account");
	});

	test.it('Foreign POA balance has correctly changed after transaction',
		async function () {
			let newForeignBalance =  await mainPage.getForeignPOABalance();
			let shouldBe = foreignBalanceBefore-maxAmountPerTransactionLimit;
			let result = (Math.abs(shouldBe-newForeignBalance))<(maxAmountPerTransactionLimit/100);
			return await assert.equal(result,true,"Test FAILED.Foreign POA balance is not correct after transaction");
		});

	test.it('Home account has received correct amount of tokens after transaction ',
		async function () {
			await homeAccount.setMetaMaskNetwork();
			let newHomeBalance =  await mainPage.getHomePOABalance();
			let shouldBe = homeBalanceBefore+maxAmountPerTransactionLimit;
			let result = (Math.abs(shouldBe-newHomeBalance))<(maxAmountPerTransactionLimit/100);
			return await assert.equal(result,true,"Test FAILED.Home POA balance is not correct after transaction");
	});

});