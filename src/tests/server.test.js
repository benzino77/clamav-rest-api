const request = require('supertest');
const { makeServer } = require('../server');
const config = require('../config');

const NodeClam = require('clamscan');
jest.mock('clamscan');

describe('Test server behavior', () => {
  let srv;
  beforeEach(async () => {
    srv = await makeServer(config);
    NodeClam.mockInit.mockClear();
    NodeClam.__setInitReject(false);
  });

  afterEach((done) => {
    srv.close(done);
  });

  it('should return 405 on post to non existing endpoit', async (done) => {
    const res = await request(srv).post('/api/v1/bleble');
    expect(res.statusCode).toEqual(405);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
    done();
  });

  it('should return 405 when using not allowed HTTP method', async (done) => {
    const res = await request(srv).post('/api/v1/version');
    expect(res.statusCode).toEqual(405);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
    done();
  });
});

describe('Test clamd communication problem', () => {
  it('should throw an error on startup that clamd is not available', async (done) => {
    NodeClam.__setInitReject(true);
    try {
      const srv = await makeServer(config);
    } catch (e) {
      error = e;
    }
    expect(NodeClam.mockInit).toHaveBeenCalledTimes(1);
    expect(error.message).toMatch(/Cannot initialize clamav object/i);
    done();
  });
});
