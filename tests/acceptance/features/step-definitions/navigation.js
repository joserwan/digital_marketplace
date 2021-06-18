const { Given, When } = require('@cucumber/cucumber');
const { Condition } = require('selenium-webdriver');
const { By, until } = require('selenium-webdriver');
const { takeScreenshot } = require('./debug')

async function goToPage(path, doScreenshot=true){
  await this.driver.get(`http://127.0.0.1:3000/${path}`);
  await this.driver.wait(until.elementLocated(By.className('footer-top-bar')));
  await this.driver.wait(new Condition('StateManager is ready', async function(driver){ 
    const isReady = await driver.executeScript('const state = stateManager.getState(); return state.ready && state.transitionLoading === 0;')
    return isReady
  }) );
  return doScreenshot && takeScreenshot.call(this)
}

Given('my browser language is {string}', async function (locale) {
  return goToPage.call(this, `/?lng=${locale}`, false);
});

Given('I open the page {string}', goToPage.bind(this));
Given('I open the home page', function(){ return goToPage.bind(this)('') })

When('I click on link with id {string}', async function (domId) {
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