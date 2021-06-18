// cucumber.js
let common = [
  '--format ../../node_modules/@cucumber/pretty-formatter', // Load custom formatter
  //'--format html', // Load custom formatter
  '--publish-quiet',
  '-f json:cucumber_report.json'
].join(' ');

module.exports = {
  default: common
};