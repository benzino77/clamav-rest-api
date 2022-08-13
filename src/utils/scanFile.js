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

module.exports = scanFile;
