const webdriver = require('selenium-webdriver');
const Twait=20000;

class Page {

	constructor(driver) {
	    this.driver=driver;
	}

	async isElementPresentWithWait(element) {
		try {
			await this.driver.wait(webdriver.until.elementLocated(element), Twait,'Element NOT present.Time out.\n');
	        return true;
		}
	        catch(err) {
	              return false;
	        }
	}

	async isElementPresent(element) {
		try {
	        await this.driver.findElement(element).isDisplayed();
		    return true;
	    }
	        catch (err) {
	            return false;
	        }
	}

	async clickWithWait(element) {
		try {
			let field;
			if (element.constructor.name!=="WebElement") {
				field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
			}
		        else field = element;
		    await field.click();
		    return true;
		}
			catch(err) {
				return false;
			}
	}

	async waitUntilLocated(element) {
		try {
			await this.driver.wait(webdriver.until.elementLocated(element), Twait);
			return true;
		}
			catch(err) {
				return false;
			}

	}

	async fillWithWait(element,k) {
       try {
           let field;
		   if (element.constructor.name!="WebElement") {
	          field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
		   }
		      else field = element;
		   await field.sendKeys(k);
		   return true;
	   }
	    catch(err) {
          return false;
	    }
	}

	async refresh() {
	    await this.driver.navigate().refresh();
	}

	async findWithWait(element) {
		try {
			await this.driver.wait(webdriver.until.elementLocated(element), Twait);
	        return await this.driver.findElements(element);
		}
	        catch(err) {
        	      return null;
		    }
	}

	async switchToNextPage(){

		let allHandles=[];
		let curHandle;
		try {
			allHandles = await this.driver.getAllWindowHandles();
			curHandle = await this.driver.getWindowHandle();
			if (allHandles.length>2) {
				let arr=[];
				arr[0]=allHandles[0];
				arr[1]=allHandles[1];
				allHandles=arr;

			}
			let handle;
			for (let i = 0; i < allHandles.length; i++) {
				if (curHandle != allHandles[i]) {
					handle = allHandles[i];
					break;
				}
			}

			await this.driver.switchTo().window(handle);
		}
		catch (err){

		}
	}

	async getUrl() {
		return await this.driver.getCurrentUrl();
	}

	async open (url) {
		await this.driver.get(url);
		return this.getUrl();

	}



}
module.exports.Page=Page;
