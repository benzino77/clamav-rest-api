let initReject = false;
let getVersionReject = false;
let scanStreamReject = false;
let scanResultInfected = false;

const rejectErrorMessage = 'Reject error';

function __setInitReject(reject) {
  initReject = reject;
}

function __setGetVersionReject(reject) {
  getVersionReject = reject;
}

function __setScanStreamReject(reject) {
  scanStreamReject = reject;
}

function __setScanResultInfected(infected) {
  scanResultInfected = infected;
}

const mockGetVersion = jest.fn().mockImplementation(() => {
  if (getVersionReject) {
    return Promise.reject(rejectErrorMessage);
  }
  return Promise.resolve('ClamAV 111.111.111/111/');
});

const mockScanStream = jest.fn().mockImplementation(() => {
  if (scanStreamReject) {
    return Promise.reject(new Error(rejectErrorMessage));
  }

  return Promise.resolve({ isInfected: scanResultInfected, viruses: scanResultInfected ? ['bad_virus'] : [] });
});

const mockInit = jest.fn().mockImplementation(() => {
  if (initReject) {
    return Promise.reject(rejectErrorMessage);
  }
  return Promise.resolve({
    getVersion: mockGetVersion,
    scanStream: mockScanStream,
  });
});

const mock = jest.fn().mockImplementation(() => {
  return { init: mockInit };
});

mock.__setInitReject = __setInitReject;
mock.__setGetVersionReject = __setGetVersionReject;
mock.__setScanStreamReject = __setScanStreamReject;
mock.__setScanResultInfected = __setScanResultInfected;

module.exports = mock;
module.exports.mockGetVersion = mockGetVersion;
module.exports.mockScanStream = mockScanStream;
module.exports.mockInit = mockInit;
module.exports.rejectErrorMessage = rejectErrorMessage;
