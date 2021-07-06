const { After, Before, BeforeAll } = require('@cucumber/cucumber');
const { Builder, Capabilities } = require('selenium-webdriver');
const process = require('process')
const { setLocale } = require('./navigation')

/**
 * Mobile screen size as of Galaxy S5
 */
const MOBILE_SCREEN = { 
  width: 360, 
  height: 640
}

/**
 * Minimum computer screen size
 */
const COMPUTER_SCREEN = { 
  width: 1280, 
  height: 720
}


var chromeCapabilities = Capabilities.chrome();
var chromeOptions = {
    'args': [
      'disable-gpu', 
      'start-maximized',
      'high-dpi-support=0.65',
      'incognito',
      'force-device-scale-factor=0.65',
      'disable-dev-shm-usage',
      'disable-notifications',
    ]
};

if(process.env.CI){
  chromeOptions.args.push('headless')
  chromeOptions.args.push('no-sandbox')
}

chromeCapabilities.set('chromeOptions', chromeOptions);

var tagsToSkip = "@todo";
Before({tags: tagsToSkip}, () => {
    return 'pending'
});

Before(async function(){
  this.driver = await new Builder()
      .forBrowser('chrome')
      .usingServer('http://selenium:4444/wd/hub')
      .withCapabilities(chromeCapabilities)
      .build()
  // Set little screen size if mobile
  await this.driver.manage().window().setRect(process.env['MOBILE']
  ? MOBILE_SCREEN
  : COMPUTER_SCREEN);

  // Set locale
  if(process.env['LOCALE']){ await setLocale.call(this, process.env['LOCALE']); }
})

After(async function() {
  if(this.driver){ await this.driver.close(); }
});