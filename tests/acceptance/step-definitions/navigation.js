const { Given, When, Then } = require('@cucumber/cucumber');
const { Condition, By, until } = require('selenium-webdriver');
const { takeScreenshot, highlightElement, highlightElementAndScreenshot } = require('./debug')

async function goToPage(path, doScreenshot=true){
  await this.driver.get(`http://ui:3000/${path}`);
  await this.driver.wait(until.elementLocated(By.className('footer-top-bar')));
  await this.driver.wait(new Condition('StateManager is ready', async function(driver){ 
    const isReady = await driver.executeScript('const state = stateManager.getState(); return state.ready && state.transitionLoading === 0;')
    return isReady
  }) );
  return doScreenshot && takeScreenshot.call(this)
}

/**
 * Set the website display language
 * 
 * TODO: Set browser locale instead of using URL
 * 
 * @param {string} locale The language to use (ie: "fr", "en")
 * @returns {Promise}
 */
function setLocale(locale) {
  return goToPage.call(this, `/?lng=${locale}`, false);
};

/**
 * Find and click on the DOM element
 * 
 * @param {string} domId DOM element ID
 * @returns {Promise}
 */
async function clickLink(domId){
  const link = await this.driver.findElement(By.id(domId));
  await highlightElementAndScreenshot.call(this, link)
  return link.click();
}

async function clickLinkByLabel(label){
  const link = await this.driver.findElement(By.linkText(label));
  await highlightElementAndScreenshot.call(this, link)
  return link.click();
}

Given('le langage de mon navigateur est {string}', function(lang){ return setLocale.call(this, lang) })
Given('my browser language is {string}', function(lang){ return setLocale.call(this, lang) });

Given('I open the page {string}', function(pageName){ return goToPage.call(this, pageName) });
Given('j\'ouvre la page {string}', function(pageName){ return goToPage.call(this, pageName) });

Given('I open the home page', function(){ return goToPage.call(this, '') })
Given('j\'ouvre la page d\'accueil', function(){ return goToPage.call(this, '') })
Given('je suis sur la page d\'accueil', function(){ return goToPage.call(this, '') })

When('je clique sur le lien dont l\'identifiant est {string}', function(domId){ return clickLink.call(this, domId) });
When('I click on link with id {string}', function(domId){ return clickLink.call(this, domId) });

When('je clique sur le bouton {string}', function(domId){ return clickLink.call(this, domId) });


When('je clique sur le lien {string}', function(label){ return clickLinkByLabel.call(this, label) });
When('I click on link {string}', function(label){ return clickLinkByLabel.call(this, label) });

Then('j\'ai une erreur {string}', function (string) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});


module.exports = {
  setLocale,
}