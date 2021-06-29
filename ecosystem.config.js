module.exports = {
  apps : [{
    name: 'migrations',
    script: 'npm run migrations:latest',
    watch: false,
    autorestart: false,
  }, {
    name: 'backend',
    script: 'npm run back-end:watch',
  }, {
    name: 'frontend',
    script: 'npm run front-end:watch',
  }],
};
