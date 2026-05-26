/*
Mock clamscan passthrough behavior for tests.

This mock returns a fresh `PassThrough` stream for each `passthrough()`
call (one stream per uploaded file), while allowing tests to set a single
`mockedStream` to emit events. Events emitted on the test-provided
`mockedStream` are delivered immediately to any already-created per-file
streams; if no streams exist yet the events are queued and assigned to the
next created stream. `resume()` calls on the test stream are forwarded to
all created streams.

This prevents races where tests emit events before the per-file stream is
created and avoids sharing the same stream instance across multiple files.
*/

const { PassThrough } = require('stream');

let initReject = false;
let getVersionReject = false;
let mockedStream;
let createdStreams = [];
let eventQueue = [];

const rejectErrorMessage = 'Reject error';

function __setInitReject(reject) {
  initReject = reject;
}

function __setGetVersionReject(reject) {
  getVersionReject = reject;
}

function __setMockedStream(stream) {
  mockedStream = stream;
  createdStreams = [];
  eventQueue = [];
  if (mockedStream && typeof mockedStream.resume === 'function') {
    const origResume = mockedStream.resume.bind(mockedStream);
    mockedStream.resume = (...args) => {
      createdStreams.forEach((s) => {
        try {
          s.resume();
        } catch (e) {
          // ignore
        }
      });
      return origResume(...args);
    };
  }

  if (mockedStream && mockedStream.on) {
    const events = ['scan-complete', 'error', 'timeout', 'end'];
    events.forEach((ev) => {
      mockedStream.on(ev, (...args) => {
        if (createdStreams.length > 0) {
          createdStreams.forEach((s) => s.emit(ev, ...args));
        } else {
          eventQueue.push({ ev, args });
        }
      });
    });
  }
}

const mockGetVersion = jest.fn().mockImplementation(() => {
  if (getVersionReject) {
    return Promise.reject(rejectErrorMessage);
  }
  return Promise.resolve('ClamAV 111.111.111/111/');
});

const mockPassThrough = jest.fn().mockImplementation(() => {
  const stream = new PassThrough();
  createdStreams.push(stream);
  if (eventQueue.length > 0) {
    const next = eventQueue.shift();
    setImmediate(() => stream.emit(next.ev, ...next.args));
  }
  return stream;
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
