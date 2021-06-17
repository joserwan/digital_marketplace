const { Given, When } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');

Given('my browser language is {string}', async function (locale) {
  await this.driver.get(`http://127.0.0.1:3000/?lng=${locale}`);
});

Given('I open the page {string}', async function (path) {
  await this.driver.get(`http://127.0.0.1:3000/${path}`);
  await this.driver.wait(until.elementLocated(By.id('main')));
});

When('I click on link with id {string}', async function (domId) {
  const source = await this.driver.getPageSource()
  var link = await this.driver.findElement(By.id(domId));
  var linkDisplayed = await link.isDisplayed()
  const s = await this.driver.sleep()
  // Menu links are displayed only if screen is big enough, 
  // otherwise it may be in the mobile-menu
  if(linkDisplayed){
    return link.click();
  } else {
    // Open menu
    var mobileMenuLink = await this.driver.findElement(By.id('toggleMobileMenu'));
    mobileMenuLink.click();

    // Wait for menu to be open
    await this.driver.wait(until.elementIsVisible(link));


    link = await this.driver.findElement(By.id(domId));
    return link.click();
  }
});