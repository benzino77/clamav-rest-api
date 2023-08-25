let initReject = false;
let getVersionReject = false;
let mockedStream;

const rejectErrorMessage = 'Reject error';

function __setInitReject(reject) {
  initReject = reject;
}

function __setGetVersionReject(reject) {
  getVersionReject = reject;
}

function __setMockedStream(stream) {
  mockedStream = stream;
}

const mockGetVersion = jest.fn().mockImplementation(() => {
  if (getVersionReject) {
    return Promise.reject(rejectErrorMessage);
  }
  return Promise.resolve('ClamAV 111.111.111/111/');
});

const mockPassThrough = jest.fn().mockImplementation(() => {
  return mockedStream;
});

const mockInit = jest.fn().mockImplementation(() => {
  if (initReject) {
    return Promise.reject(rejectErrorMessage);
  }
  return Promise.resolve({
    getVersion: mockGetVersion,
    passthrough: mockPassThrough,
  });
});

const mock = jest.fn().mockImplementation(() => {
  return { init: mockInit };
});

mock.__setInitReject = __setInitReject;
mock.__setGetVersionReject = __setGetVersionReject;
mock.__setMockedStream = __setMockedStream;

module.exports = mock;
module.exports.mockGetVersion = mockGetVersion;
module.exports.mockPassThrough = mockPassThrough;
module.exports.mockInit = mockInit;
module.exports.rejectErrorMessage = rejectErrorMessage;
