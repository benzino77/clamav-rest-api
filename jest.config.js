const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, 'src/tests/test.env'),
});

module.exports = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js', // there is no need to test this, its just a wrapper
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/serviceWorker.js',
    '!**/index.js',
  ],
};
