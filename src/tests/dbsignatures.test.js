const request = require('supertest');
const { makeServer } = require('../server');
const config = require('../config');

const dns = require('dns');
jest.mock('dns');

const NodeClam = require('clamscan');
jest.mock('clamscan');

let srv;

describe('Test "dbsignatures" API endpoint', () => {
  beforeEach(async () => {
    srv = await makeServer(config);
    NodeClam.mockGetVersion.mockClear();
    NodeClam.__setGetVersionReject(false);
  });

  afterEach((done) => {
    srv.close(done);
  });

  it('should return 500 and proper error message on DNS query failure', async (done) => {
    const mockErrorMessage = 'This is error';
    dns.resolveTxt.mockImplementation((hostname, cb) => {
      cb(mockErrorMessage, []);
    });
    const res = await request(srv).get('/api/v1/dbsignatures');
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
    expect(res.body.data.error).toEqual(mockErrorMessage);
    done();
  });

  it('should return 500 on clamd error', async (done) => {
    const mockRemoteSignatureValue = '33333';
    dns.resolveTxt.mockImplementation((hostname, cb) => {
      cb('', [[`0.103.6:62:${mockRemoteSignatureValue}:1658383200:1:90:49192:333`]]);
    });

    NodeClam.__setGetVersionReject(true);

    const res = await request(srv).get('/api/v1/dbsignatures');
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
    expect(res.body.data.error).toEqual(NodeClam.rejectErrorMessage);
    done();
  });

  it('Should return signature numbers', async (done) => {
    const mockRemoteSignatureValue = '33333';
    dns.resolveTxt.mockImplementation((hostname, cb) => {
      cb('', [[`0.103.6:62:${mockRemoteSignatureValue}:1658383200:1:90:49192:333`]]);
    });
    const res = await request(srv).get('/api/v1/dbsignatures');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('remote_clamav_db_signature');
    expect(res.body.data.remote_clamav_db_signature).toEqual(mockRemoteSignatureValue);
    done();
  });
});
