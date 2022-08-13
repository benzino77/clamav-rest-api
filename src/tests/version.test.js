const request = require('supertest');
const { makeServer } = require('../server');
const config = require('../config');

const NodeClam = require('clamscan');
jest.mock('clamscan');

describe('Test "version" API endpoint', () => {
  let srv;
  beforeEach(async () => {
    srv = await makeServer(config);
    NodeClam.mockGetVersion.mockClear();
    NodeClam.__setGetVersionReject(false);
  });

  afterEach((done) => {
    srv.close(done);
  });

  it('should return 500 on clamd error', async (done) => {
    NodeClam.__setGetVersionReject(true);
    const res = await request(srv).get('/api/v1/version');
    expect(NodeClam.mockGetVersion).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.error).toBe(NodeClam.rejectErrorMessage);
    done();
  });

  it('should return ClamAV version', async (done) => {
    const res = await request(srv).get('/api/v1/version');
    expect(NodeClam.mockGetVersion).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.version).toMatch(/^ClamAV \d+\.\d+\.\d+\/\d+\//);
    done();
  });
});
