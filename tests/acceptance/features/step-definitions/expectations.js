const { Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { By } = require('selenium-webdriver');

Then('I should see {string}', async function (string) {
  // Write code here that turns the phrase above into concrete actions
  const description = await this.driver.findElement(By.id('main')).getText();
  expect(description).to.include(string)
});