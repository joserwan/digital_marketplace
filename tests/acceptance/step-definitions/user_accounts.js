const { Given } = require('@cucumber/cucumber');
const process = require('process')

Given('l\'authentification {string} est permise', function (string) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

Given('l\'authentification {string} est désactivée', function (string) {
  // Environment variable GITHUBID must be removed before the front-end transpilation
  // process.env.GITHUBID = undefined
});

Given('j\'ai compte ClicSecure Express avec les informations suivantes:', function (dataTable) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});
