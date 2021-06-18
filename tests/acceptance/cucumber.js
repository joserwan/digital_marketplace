const process = require('process')
let common = [
  '--format ../../node_modules/@cucumber/pretty-formatter', // Load custom formatter
  //'--format html', // Load custom formatter
  '--publish-quiet',
  '--require step-definitions/**/*.js',
  '-f json:cucumber_report.json'
];


if(process.env['LOCALE'] === 'fr'){
  common.push('--language fr')
  common.push('fonctionnalites/**/*.feature')
} else {
  common.push('features/**/*.feature')
}


console.log(common.join(' '))

module.exports = {
  default: common.join(' ')
};