const process = require('process')
let common = [
  '--format ../../node_modules/@cucumber/pretty-formatter', // Load custom formatter
  '--format html:cucumber_report_simple.html', // Load custom formatter
  '--publish-quiet',
  '--require ../../../../src/back-end/start.js',
  '--require step-definitions/**/*.js',
  '-f json:cucumber_report.json',
];


if(process.env['LOCALE'] === 'fr'){
  common.push('--language fr')
  common.push('fonctionnalites/**/*.feature')
} else {
  common.push('features/**/*.feature')
}

if(process.env['TAGS']){
  common.push(`--tags ${process.env['TAGS']}`)
}

module.exports = {
  default: common.join(' ')
};