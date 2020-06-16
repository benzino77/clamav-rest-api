const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();

form.append('FILES', fs.createReadStream('../../src/tests/1Mfile01.rnd'));
form.append('FILES', fs.createReadStream('../../src/tests/eicar_com.zip'));

fetch('http://localhost:3000/api/v1/scan', { method: 'POST', body: form })
  .then((res) => res.json())
  .then((json) => console.log(JSON.stringify(json, null, 2)))
  .catch((e) => {
    console.log(e);
  });
