require('dotenv').config();
const config = require('./config');
const { makeServer } = require('./server');

(async () => {
  try {
    await makeServer(config);
  } catch (e) {
    console.log(e.message);
  }
})();
