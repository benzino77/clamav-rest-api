const express = require('express');
const router = express.Router();
const _ = require('lodash');
const { Readable } = require('stream');

const scanFile = async (upload, av) => {
  const fileStream = new Readable();
  fileStream.push(upload.data);
  fileStream.push(null);
  const result = await av.scanStream(fileStream);
  return {
    name: upload.name,
    is_infected: result.isInfected,
    viruses: result.viruses,
  };
};

router.route('/').post(async (req, res, next) => {
  const av = req._av;
  const MAX_FILES_NUMBER = process.env.APP_MAX_FILES_NUMBER || 4;
  const hasProperKey = _.has(req.files, process.env.APP_FORM_KEY);
  const passedFiles = _.keys(req.files);

  if (!req.files || passedFiles.length === 0) {
    return res.status(400).json({
      success: false,
      data: { error: 'No files were uploaded' },
    });
  }
  if (!hasProperKey || passedFiles.length > 1) {
    return res.status(400).json({
      success: false,
      data: {
        error: `The request should have only ${process.env.APP_FORM_KEY} key`,
      },
    });
  }
  if (
    _.isArray(req.files[process.env.APP_FORM_KEY]) &&
    req.files[process.env.APP_FORM_KEY].length > MAX_FILES_NUMBER
  ) {
    return res.status(400).json({
      success: false,
      data: {
        error: `Too much files uploaded. Max number of files to scan is ${MAX_FILES_NUMBER}.`,
      },
    });
  }

  const toScan = _.isArray(req.files[process.env.APP_FORM_KEY])
    ? req.files[process.env.APP_FORM_KEY]
    : [req.files[process.env.APP_FORM_KEY]];

  let resultArray = [];
  for (const f of toScan) {
    try {
      const r = await scanFile(f, av);
      resultArray.push(r);
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, data: { error: err.message } });
    }
  }
  res.json({ success: true, data: { result: resultArray } });
});

module.exports = router;
