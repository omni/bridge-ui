const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome');
const fs = require('fs-extra');
const configFile='./e2e-script/config.json';


class Utils {

  static  async getHomeAccount() {
    try {
	  let obj = JSON.parse(fs.readFileSync(configFile), "utf8");
	  return obj.homeAccount;
	} catch (err) {
	  return null;
	}
  }

  static async getForeignAccount() {
    try {
	  let obj = JSON.parse(fs.readFileSync(configFile), "utf8");
	  return obj.foreignAccount;
	} catch (err) {
	    return null;
    }
  }

  static async getStartURL() {
    try {
	  let obj = JSON.parse(fs.readFileSync(configFile), "utf8");
	  return obj.startUrl;
	} catch (err) {
	  return null;
	}
  }

  static async  startBrowserWithMetamask() {
    let source = './e2e-script/MetaMask.crx';
	let options = new chrome.Options();
	options.addExtensions(source);
	options.addArguments('disable-popup-blocking');
	return await new webdriver.Builder().withCapabilities(options.toCapabilities()).build();
  }

  static async getPathToFileInPWD(fileName) {
    return  process.env.PWD+"/" +fileName;
  }

}
module.exports = {
  Utils:Utils
}

