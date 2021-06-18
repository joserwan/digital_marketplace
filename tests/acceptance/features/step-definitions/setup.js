const { After, AfterAll, Before } = require('@cucumber/cucumber');
const { Builder, Capabilities } = require('selenium-webdriver');
const path = require('path')



var chromeCapabilities = Capabilities.chrome();
//setting chrome options to start the browser fully maximized
var chromeOptions = {
    'args': [
      'disable-gpu', 
      'start-maximized',
      'high-dpi-support=0.65',
      'force-device-scale-factor=0.65',
      'headless',
      'disable-dev-shm-usage',
      'window-size=1920x1080',
      'disable-notifications',
    ]
};
chromeCapabilities.set('chromeOptions', chromeOptions);

Before(async function(){
  this.driver = new Builder()
      .forBrowser('chrome')
      .usingServer('http://localhost:4444/wd/hub')
      .withCapabilities(chromeCapabilities)
      .build()
      await this.driver.manage().window().maximize();
})

After(async function() {
  await this.driver.close();
});