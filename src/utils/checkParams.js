const checkParams = (req) => {
  const noFilesError = 'No files were uploaded';
  const invalidFormKeyError = `The request should have only ${process.env.APP_FORM_KEY} key`;
  const MAX_FILES_NUMBER = process.env.APP_MAX_FILES_NUMBER || 4;
  const tooMuchFilesError = `Too much files uploaded. Max number of files to scan is ${MAX_FILES_NUMBER}.`;

  if (!req.files) {
    return noFilesError;
  }

  const passedFilesLength = Object.keys(req.files).length;
  if (passedFilesLength === 0) {
    return noFilesError;
  }

  const hasProperKey = Object.getOwnPropertyNames(req.files).includes(process.env.APP_FORM_KEY);
  if (!hasProperKey || passedFilesLength > 1) {
    return invalidFormKeyError;
  }

  if (
    Array.isArray(req.files[process.env.APP_FORM_KEY]) &&
    req.files[process.env.APP_FORM_KEY].length > MAX_FILES_NUMBER
  ) {
    return tooMuchFilesError;
  }

  return false;
};

module.exports = { checkParams };
