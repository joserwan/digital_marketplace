const { After, Before } = require('@cucumber/cucumber');
const { Builder } = require('selenium-webdriver');

Before(async function(){
  this.driver = new Builder()
      .forBrowser('chrome')
      .usingServer('http://localhost:4444/wd/hub')
      .build()
      await this.driver.manage().window().maximize();
})

After(async function() {
  await this.driver.close();
});