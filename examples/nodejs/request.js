const request = require('request');
const fs = require('fs');

const formData = {
  FILES: [
    fs.createReadStream('../../src/tests/1Mfile01.rnd'),
    fs.createReadStream('../../src/tests/eicar_com.zip'),
  ],
};

request.post(
  { url: 'http://localhost:3000/api/v1/scan', formData: formData },
  (err, res, body) => {
    const parsed = JSON.parse(body);
    const formatted = JSON.stringify(parsed, null, 2);
    console.log(formatted);
  }
);
