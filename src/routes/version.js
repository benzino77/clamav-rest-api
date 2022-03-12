const express = require('express');
const router = express.Router();

// router.route('/').get((req, res, next) => {
//   const av = req._av;
//   av.get_version((err, vers) => {
//     if (err) {
//       res.status(500).json({
//         status: 'fail',
//         data: {
//           error: err,
//         },
//       });
//     } else {
//       res.json({
//         status: 'success',
//         data: {
//           version: vers.trim(),
//         },
//       });
//     }
//   });
// });

// PR is waiting for aproval: https://github.com/kylefarris/clamscan/pull/48
// then it can be done with async/awit

router.route('/').get(async (req, res, next) => {
  const av = req._av;
  try {
    const vers = await av.getVersion();
    res.json({
      success: true,
      data: {
        version: vers,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      data: {
        error: err,
      },
    });
  }
});
module.exports = router;
