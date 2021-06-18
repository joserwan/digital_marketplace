const { After, Before } = require('@cucumber/cucumber');
const { Builder, Capabilities } = require('selenium-webdriver');
const process = require('process')

/**
 * Mobile screen size as of Galaxy S5
 */
const MOBILE_SCREEN = { 
  width: 360, 
  height: 640
}


var chromeCapabilities = Capabilities.chrome();
//setting chrome options to start the browser fully maximized
var chromeOptions = {
    'args': [
      'disable-gpu', 
      'start-maximized',
      'high-dpi-support=0.65',
      'force-device-scale-factor=0.65',
 //     'headless',
      'disable-dev-shm-usage',
      'window-size=1920x1080',
      'disable-notifications',
    ]
};
chromeCapabilities.set('chromeOptions', chromeOptions);

Before(async function(){
  this.driver = await new Builder()
      .forBrowser('chrome')
      .usingServer('http://localhost:4444/wd/hub')
      .withCapabilities(chromeCapabilities)
      .build()
  if(process.env['MOBILE']){ await this.driver.manage().window().setRect(MOBILE_SCREEN); }
})

After(async function() {
  await this.driver.close();
});