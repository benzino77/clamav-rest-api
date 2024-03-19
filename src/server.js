const NodeClam = require('clamscan');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
// const bodyParser = require('body-parser');

const versionRouter = require('./routes/version');
const scanRouter = require('./routes/scan');
const scan2Router = require('./routes/scan2');
const dbSignaturesRouter = require('./routes/dbsignatures');

async function makeServer(cfg) {
  try {
    const newAvConfig = Object.assign({}, cfg.avConfig);
    const clamscan = await new NodeClam().init(newAvConfig);
    const PORT = process.env.APP_PORT || 3000;
    const app = express();

    app.use(cors());
    // app.use(bodyParser.json());
    // app.use(bodyParser.urlencoded({ extended: true }));
    app.use((req, res, next) => {
      req._av = clamscan;
      next();
    });

    app.use(fileUpload({ ...cfg.fuConfig }));
    process.env.NODE_ENV !== 'test' &&
      app.use(morgan(process.env.APP_MORGAN_LOG_FORMAT || 'combined'));
    app.use('/api/v1/version', versionRouter);
    app.use('/api/v1/scan', scanRouter);
    app.use('/api/v1/scan2', scan2Router);
    app.use('/api/v1/dbsignatures', dbSignaturesRouter);
    app.all('*', (req, res, next) => {
      res.status(405).json({ success: false, data: { error: 'Not allowed.' } });
    });

    const srv = app.listen(PORT, () => {
      process.env.NODE_ENV !== 'test' &&
        console.log(`Server started on PORT: ${PORT}`);
    });
    return srv;
  } catch (error) {
    throw new Error(`Cannot initialize clamav object: ${error}`);
  }
}

module.exports = { makeServer };
