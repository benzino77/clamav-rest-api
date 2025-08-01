const express = require('express');
const router = express.Router();
const dns = require('dns');

router.route('/').get(async (req, res, next) => {
  dns.resolveTxt('current.cvd.clamav.net', async (error, records) => {
    if (error) {
      return res.status(500).json({
        success: false,
        data: {
          error: error,
        },
      });
    }

    const av = req._av;
    let localVersion;
    try {
      localVersion = await av.getVersion();
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: {
          error: err,
        },
      });
    }

    localVersion = localVersion.split(' ')[1].split('/')[1];
    const remoteVersion = records[0][0].split(':')[2];
    res.json({
      success: true,
      data: {
        local_clamav_db_signature: localVersion,
        remote_clamav_db_signature: remoteVersion,
        diff: remoteVersion === localVersion,
      },
    });
  });
});

module.exports = router;
