const { Readable } = require('stream');

const scanFile = async (upload, av) => {
  if (upload.size <= 0) {
    return {
      name: upload.name,
      is_infected: false,
      viruses: [],
    };
  }
  let chunk = new Buffer.from(upload.data);

  const fileStream = new Readable();
  fileStream._read = () => {
    fileStream.push(chunk);
    chunk = null;
  };

  const tcpStream = av.passthrough();
  fileStream.pipe(tcpStream);

  const result = await new Promise((resolve, reject) =>
    tcpStream
      .on('scan-complete', (data) => {
        resolve(data);
      })
      .on('error', (error) => {
        reject(error);
      })
      .on('timeout', (error) => {
        reject(error);
      })
  );

  return {
    name: upload.name,
    is_infected: result.isInfected,
    viruses: result.viruses,
  };
};

module.exports = scanFile;
