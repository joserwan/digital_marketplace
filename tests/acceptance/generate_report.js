const path = require('path')
const reporter = require('cucumber-html-reporter');

var options = {
  theme: 'bootstrap',
  jsonFile: path.join(__dirname, 'cucumber_report.json'),
  output: path.join(__dirname, 'cucumber_report.html'),
  reportSuiteAsScenarios: true,
  screenshotsDirectory: path.join(__dirname, 'screenshots/'),
  storeScreenshots: true,
  scenarioTimestamp: true,
  launchReport: true,
  metadata: {
    "App Version":"0.3.2",
    "Test Environment": "STAGING",
    "Browser": "Chrome  54.0.2840.98",
    "Platform": "Windows 10",
    "Parallel": "Scenarios",
    "Executed": "Remote"
  }
};
reporter.generate(options);