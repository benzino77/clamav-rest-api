const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();

form.append('FILES', fs.createReadStream('../../src/tests/1Mfile01.rnd'));
form.append('FILES', fs.createReadStream('../../src/tests/eicar_com.zip'));

const formHeaders = form.getHeaders();

axios
  .post('http://localhost:3000/api/v1/scan', form, {
    headers: { ...formHeaders },
  })
  .then((res) => console.log(JSON.stringify(res.data, null, 2)))
  .catch((e) => console.log(e.message));
