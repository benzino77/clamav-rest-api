require('dotenv').config();
const config = require('./config');
const { makeServer } = require('./server');

makeServer(config);
