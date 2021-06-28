const { Given } = require('@cucumber/cucumber');
const { expect } = require('chai');
const process = require('process')

Given('l\'authentification {string} est permise', function (string) {
  expect(process.env.KEYCLOAK_CLIENT_SECRET).to.exist
});

Given('l\'authentification {string} est désactivée', function (string) {
  // Environment variable GITHUBID must be removed before the front-end transpilation
  // process.env.GITHUBID = undefined
});

Given('j\'ai compte ClicSequr Express avec les informations suivantes:', function (dataTable) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

Given('j\'ai compte Keycloak avec les informations suivantes:', function (dataTable) {
  // Write code here that turns the phrase above into concrete actions
  return 'pending';
});

Given('la création de compte prestataire est désactivée', function () {
  expect(!!process.env.VENDOR_ACCOUNT_CREATION_DISABLED).to.be.true
})