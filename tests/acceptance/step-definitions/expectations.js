const { Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { By } = require('selenium-webdriver');

/**
 * 
 * @param {string} content Text to validate presence
 */
async function shouldSee (content) {
  const text = await this.driver.findElement(By.id('main')).getText();
  expect(text).to.include(content)
}

Then('I should see {string}', function(content){ return shouldSee.call(this, content) });
Then('je devrais voir {string}', function(content){ return shouldSee.call(this, content) })