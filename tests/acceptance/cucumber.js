// cucumber.js
let common = [
  '--format ../../node_modules/@cucumber/pretty-formatter', // Load custom formatter
  '--publish-quiet'
].join(' ');

module.exports = {
  default: common
};