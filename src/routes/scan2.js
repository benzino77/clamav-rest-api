const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { checkParams } = require('../utils/checkParams');
const scanFile = require('../utils/scanFile');
const { Readable } = require('stream');

const uploadDir = path.join(__dirname, 'uploads');

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

  const chunkIndex = req.body.chunkIndex
  const totalChunk = req.body.totalChunk

  const f = Array.isArray(req.files[process.env.APP_FORM_KEY]) ? req.files[process.env.APP_FORM_KEY][0] : req.files[process.env.APP_FORM_KEY];
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const fileName = f.name;
  try {
    fs.writeFileSync(path.join(uploadDir, `${fileName}_part_${chunkIndex}`), f.data);
  } catch (error) {
    return res.status(500).json({ error: 'Error saving chunk file' });
  }

  console.log(`Chunk ${chunkIndex} uploaded`);
  console.log(`Total chunk ${totalChunk}`);

  if (chunkIndex == totalChunk - 1) {
    console.log('All chunks uploaded');
    
    const fileParts = fs.readdirSync(uploadDir)
        .filter(file => file.startsWith(`${fileName}_part_`))
        .sort((a, b) => {
            const [, indexA] = a.split('_part_');
            const [, indexB] = b.split('_part_');
            return parseInt(indexA) - parseInt(indexB);
        });
    
    const combinedFilePath = path.join(uploadDir, `${fileName}_combined`);

    const writeStream = fs.createWriteStream(combinedFilePath);
    fileParts.forEach(filePart => {
        const filePath = path.join(uploadDir, filePart);
        console.log(filePath);
        const data = fs.readFileSync(filePath);
        console.log(data);
        writeStream.write(data);
        fs.unlinkSync(filePath); // Delete chunk file after combining
    });

    writeStream.end();

    resultArray = [];

    try {
      const o = {
        data: fs.readFileSync(combinedFilePath),
        name: fileName,
      }
      const r = await scanFile(o, av);
      console.log(r);
      resultArray.push(r);
    } catch (err) {
      return res.status(500).json({ success: false, data: { error: err.message } });
    }

    res.json({ success: true, data: { result: resultArray } });
  } else {
    res.json({ success: true, data: { result: 'chunk uploaded' } });
  }

  // const toScan = Array.isArray(req.files[process.env.APP_FORM_KEY])
  //   ? req.files[process.env.APP_FORM_KEY]
  //   : [req.files[process.env.APP_FORM_KEY]];

  // let resultArray = [];
  // for (const f of toScan) {
  //   try {
  //     const r = await scanFile(f, av);
  //     resultArray.push(r);
  //   } catch (err) {
  //     return res.status(500).json({ success: false, data: { error: err.message } });
  //   }
  // }
  // res.json({ success: true, data: { result: resultArray } });
});

module.exports = router;
