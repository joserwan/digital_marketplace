const { When } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path')
const uuid = require('uuid');

async function takeScreenshot (filename = uuid.v4() + '.png') {
  const buffer = await this.driver.takeScreenshot();
  const filePath = path.join(__dirname, '..', 'screenshots', filename)
  fs.writeFileSync( filePath, buffer, { encoding: 'base64', flag: 'w+'} )
  await this.attach(buffer, 'image/png');
};

When('I take a screenshot {string}', takeScreenshot)

module.exports = {
  a: 3,
  g: 3
}
module.exports.takeScreenshot = takeScreenshot