const { When } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path')
const uuid = require('uuid');

/**
 * Take a screenshot and include it to the report. If a filename is given,
 * the file is saved on the filesystem.
 * 
 * @param {[string]} filename The file name of the picture, with extension
 */
async function takeScreenshot (filename) {
  const buffer = await this.driver.takeScreenshot();
  if(filename){
    const filePath = path.join(__dirname, '..', 'screenshots', filename)
    fs.writeFileSync( filePath, buffer, { encoding: 'base64', flag: 'w+'} )
  }
  await this.attach(buffer, 'base64:image/png');
};

/**
 * Highlight a element by drawing a red border around it.
 * 
 * @param {WebElement} webElement The element to highlight
 */
async function highlightElement (webElement) {
  await this.driver.executeScript("arguments[0].setAttribute('style','border: dashed 4px red');", webElement);
  await this.driver.sleep(100) // Let new style the time to be applied
};

/**
 * Highlight the given element then take a screenshot
 * 
 * @param {WebElement} webElement the element to highlight
 */
async function highlightElementAndScreenshot (webElement){
  await highlightElement.call(this, webElement)
  await takeScreenshot.call(this)
  await this.driver.executeScript("arguments[0].setAttribute('style','');", webElement);
}

When('I take a screenshot {string}', takeScreenshot)
When('je prends une capture d\'écran', function(){ return takeScreenshot.bind(this)() })
module.exports = {
  takeScreenshot,
  highlightElement,
  highlightElementAndScreenshot,
}