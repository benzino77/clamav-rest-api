require('dotenv').config();
const config = require('./config');
const { makeServer } = require('./server');

(async () => {
  try {
    var startupRetry = config.avConfig.clamdscan.startupRetry;
    var count = 0;
    var success = false;
    while (count != startupRetry) {
      count = count + 1;
      try {
        await makeServer(config);
        success = true;
        break;// Server is online.
      }
      catch (error) {
        console.log(`"(${count}-${startupRetry}): Clam AV Server not ready!!"`);
        console.log(error);
        await new Promise(r => setTimeout(r, 5000));
      }
    }
    if (success == false) {
      throw new Error("Application failed to start. Please check the message log.");
    }
  } catch (e) {
    console.log(e.message);
  }
})();
