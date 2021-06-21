const { Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { By } = require('selenium-webdriver');

/**
 * Validates that a content is displayed within the current page
 * 
 * @param {string} content Text whose presence must be validated
 */
 async function shouldSee (content) {
  const text = await this.driver.findElement(By.id('main')).getText();
  expect(text).to.include(content)
}

/**
 * Validates that a content is not displayed within the current page
 * 
 * @param {string} content Text whose absence must be validated
 */
async function shouldNotSee (content) {
  const text = await this.driver.findElement(By.id('main')).getText();
  expect(text).not.to.include(content)
}

Then('I should see {string}', function(content){ return shouldSee.call(this, content) });
Then('je devrais voir {string}', function(content){ return shouldSee.call(this, content) })
Then('je vois {string}', function(content){ return shouldSee.call(this, content) })

Then('je ne vois pas {string}', function(content){ return shouldNotSee.call(this, content) });
