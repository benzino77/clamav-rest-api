const request = require('supertest');
const { makeServer } = require('../server');
const config = require('../config');

const cleanFile01 = 'src/tests/1Mfile01.rnd';
const cleanFile02 = 'src/tests/1Mfile02.rnd';
const cleanFile03 = 'src/tests/1Mfile03.rnd';
const cleanFile04 = 'src/tests/1Mfile04.rnd';
const bigFile = 'src/tests/3Mfile.rnd';
const infectedFile = 'src/tests/eicar_com.zip';

const NodeClam = require('clamscan');
jest.mock('clamscan');

describe('Test "scan" API endpoint', () => {
  let srv;
  beforeEach(async () => {
    srv = await makeServer(config);
    NodeClam.mockScanStream.mockClear();
    NodeClam.__setScanResultInfected(false);
    NodeClam.__setScanStreamReject(false);
  });

  afterEach((done) => {
    srv.close(done);
  });

  it('should return 400 on scan without file', async (done) => {
    const res = await request(srv).post('/api/v1/scan');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
    done();
  });

  it('should return 400 on wrong form key', async (done) => {
    const res = await request(srv).post('/api/v1/scan').attach(`__${process.env.APP_FORM_KEY}`, cleanFile01);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
    done();
  });

  it('should return 400 on more than one form key', async (done) => {
    const res = await request(srv)
      .post('/api/v1/scan')
      .attach(`__${process.env.APP_FORM_KEY}`, cleanFile01)
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile02);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
    done();
  });

  it('should return 413 on scan too big file', async (done) => {
    const res = await request(srv).post('/api/v1/scan').attach(`${process.env.APP_FORM_KEY}`, bigFile);
    expect(res.statusCode).toEqual(413);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
    done();
  });

  it('should return 400 on upload too much files', async (done) => {
    const res = await request(srv)
      .post('/api/v1/scan')
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile01)
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile02)
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile03)
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile04);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
    done();
  });

  it('should return 500 on clamd error', async (done) => {
    NodeClam.__setScanStreamReject(true);
    const res = await request(srv).post('/api/v1/scan').attach(`${process.env.APP_FORM_KEY}`, cleanFile01);
    expect(NodeClam.mockScanStream).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
    done();
  });

  it('should report is_infected=false on scan one clean file', async (done) => {
    const res = await request(srv).post('/api/v1/scan').attach(`${process.env.APP_FORM_KEY}`, cleanFile01);
    expect(NodeClam.mockScanStream).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('result');
    expect(Array.isArray(res.body.data.result)).toBe(true);
    expect(Array.isArray(res.body.data.result[0].viruses)).toBe(true);
    expect(res.body.data.result[0].viruses.length).toBe(0);
    expect(res.body.data.result[0].is_infected).toBe(false);
    done();
  });

  it('should report is_infected=false on scan two clean files', async (done) => {
    const res = await request(srv)
      .post('/api/v1/scan')
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile01)
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile02);
    expect(NodeClam.mockScanStream).toHaveBeenCalledTimes(2);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('result');
    expect(Array.isArray(res.body.data.result)).toBe(true);
    expect(Array.isArray(res.body.data.result[0].viruses)).toBe(true);
    expect(res.body.data.result[0].viruses.length).toBe(0);
    expect(Array.isArray(res.body.data.result[1].viruses)).toBe(true);
    expect(res.body.data.result[1].viruses.length).toBe(0);
    expect(res.body.data.result[0].is_infected).toBe(false);
    expect(res.body.data.result[1].is_infected).toBe(false);
    done();
  });

  it('should report is_infected=true on scan one infected file', async (done) => {
    NodeClam.__setScanResultInfected(true);
    const res = await request(srv).post('/api/v1/scan').attach(`${process.env.APP_FORM_KEY}`, infectedFile);
    expect(NodeClam.mockScanStream).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('result');
    expect(Array.isArray(res.body.data.result)).toBe(true);
    expect(Array.isArray(res.body.data.result[0].viruses)).toBe(true);
    expect(res.body.data.result[0].viruses.length).toBe(1);
    expect(res.body.data.result[0].is_infected).toBe(true);
    done();
  });

  it('should report is_infected=true and is_infected=false on scan infected and clean file', async (done) => {
    NodeClam.mockScanStream
      .mockReturnValueOnce(Promise.resolve({ isInfected: true, viruses: ['bad_virus'] }))
      .mockReturnValueOnce(Promise.resolve({ isInfected: false, viruses: [] }));
    const res = await request(srv)
      .post('/api/v1/scan')
      .attach(`${process.env.APP_FORM_KEY}`, infectedFile)
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile01);
    expect(NodeClam.mockScanStream).toHaveBeenCalledTimes(2);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('result');
    expect(Array.isArray(res.body.data.result)).toBe(true);
    expect(Array.isArray(res.body.data.result[0].viruses)).toBe(true);
    expect(res.body.data.result[0].viruses.length).toBe(1);
    expect(Array.isArray(res.body.data.result[1].viruses)).toBe(true);
    expect(res.body.data.result[1].viruses.length).toBe(0);
    expect(res.body.data.result[0].is_infected).toBe(true);
    expect(res.body.data.result[1].is_infected).toBe(false);
    done();
  });
});
