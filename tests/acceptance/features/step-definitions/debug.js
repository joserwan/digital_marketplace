const { When } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path')

When('I take a screenshot {string}', async function (filename) {
  const img = await this.driver.takeScreenshot();
  const filePath = path.join(__dirname, '..', '..', 'screenshots', filename)
  fs.writeFileSync( filePath, img, { encoding: 'base64', flag: 'w+'} )
});