const express = require('express');
const router = express.Router();
const { checkParams } = require('../utils/checkParams');
const scanFile = require('../utils/scanFile');
const { Readable } = require('stream');

router.route('/').post(async (req, res, next) => {
  const av = req._av;

  const errorMessage = checkParams(req);
  if (errorMessage) {
    return res.status(400).json({
      success: false,
      data: {
        error: errorMessage,
      },
    });
  }

  const toScan = Array.isArray(req.files[process.env.APP_FORM_KEY])
    ? req.files[process.env.APP_FORM_KEY]
    : [req.files[process.env.APP_FORM_KEY]];

  let resultArray = [];
  for (const f of toScan) {
    try {
      const r = await scanFile(f, av);
      resultArray.push(r);
    } catch (err) {
      return res.status(500).json({ success: false, data: { error: err.message } });
    }
  }
  res.json({ success: true, data: { result: resultArray } });
});

module.exports = router;
