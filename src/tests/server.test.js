const request = require('supertest');
const _ = require('lodash');
const { makeServer } = require('../server');
const config = require('../config');

const cleanFile01 = 'src/tests/1Mfile01.rnd';
const cleanFile02 = 'src/tests/1Mfile02.rnd';
const cleanFile03 = 'src/tests/1Mfile03.rnd';
const cleanFile04 = 'src/tests/1Mfile04.rnd';
const bigFile = 'src/tests/3Mfile.rnd';
const infectedFile = 'src/tests/eicar_com.zip';

describe('Test return codes', () => {
  let srv;
  beforeEach(async () => {
    srv = await makeServer(config);
  });

  afterEach((done) => {
    srv.close(done);
  });

  it('should return 405 on post to /api/v1/version', async (done) => {
    const res = await request(srv).post('/api/v1/version');
    expect(res.statusCode).toEqual(405);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('error');
    done();
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
    const res = await request(srv)
      .post('/api/v1/scan')
      .attach(`__${process.env.APP_FORM_KEY}`, cleanFile01);
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
    const res = await request(srv)
      .post('/api/v1/scan')
      .attach(`${process.env.APP_FORM_KEY}`, bigFile);
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
});
describe('Test API endpoints', () => {
  let srv;
  beforeEach(async () => {
    srv = await makeServer(config);
  });

  afterEach((done) => {
    srv.close(done);
  });

  it('should return ClamAV version', async (done) => {
    const res = await request(srv).get('/api/v1/version');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.version).toMatch(/^ClamAV \d+\.\d+\.\d+\/\d+\//);
    done();
  });
  it('should report is_infected=false on scan one clean file', async (done) => {
    const res = await request(srv)
      .post('/api/v1/scan')
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile01);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('result');
    expect(_.isArray(res.body.data.result)).toBe(true);
    expect(_.isArray(res.body.data.result[0].viruses)).toBe(true);
    expect(_.isEmpty(res.body.data.result[0].viruses)).toBe(true);
    expect(res.body.data.result[0].is_infected).toBe(false);
    done();
  });
  it('should report is_infected=false on scan two clean files', async (done) => {
    const res = await request(srv)
      .post('/api/v1/scan')
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile01)
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile02);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('result');
    expect(_.isArray(res.body.data.result)).toBe(true);
    expect(_.isArray(res.body.data.result[0].viruses)).toBe(true);
    expect(_.isEmpty(res.body.data.result[0].viruses)).toBe(true);
    expect(_.isArray(res.body.data.result[1].viruses)).toBe(true);
    expect(_.isEmpty(res.body.data.result[1].viruses)).toBe(true);
    expect(res.body.data.result[0].is_infected).toBe(false);
    expect(res.body.data.result[1].is_infected).toBe(false);
    done();
  });
  it('should report is_infected=true on scan one infected file', async (done) => {
    const res = await request(srv)
      .post('/api/v1/scan')
      .attach(`${process.env.APP_FORM_KEY}`, infectedFile);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('result');
    expect(_.isArray(res.body.data.result)).toBe(true);
    expect(_.isArray(res.body.data.result[0].viruses)).toBe(true);
    expect(_.isEmpty(res.body.data.result[0].viruses)).toBe(false);
    expect(res.body.data.result[0].is_infected).toBe(true);
    done();
  });
  it('should report is_infected=true and is_infected=false on scan infected and clean file', async (done) => {
    const res = await request(srv)
      .post('/api/v1/scan')
      .attach(`${process.env.APP_FORM_KEY}`, infectedFile)
      .attach(`${process.env.APP_FORM_KEY}`, cleanFile01);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('result');
    expect(_.isArray(res.body.data.result)).toBe(true);
    expect(_.isArray(res.body.data.result[0].viruses)).toBe(true);
    expect(_.isEmpty(res.body.data.result[0].viruses)).toBe(false);
    expect(_.isArray(res.body.data.result[1].viruses)).toBe(true);
    expect(_.isEmpty(res.body.data.result[1].viruses)).toBe(true);
    expect(res.body.data.result[0].is_infected).toBe(true);
    expect(res.body.data.result[1].is_infected).toBe(false);
    done();
  });
});

describe('Test communication errors', () => {
  it('should throw an error on startup that clamd is not available', async (done) => {
    let error;
    const newConfig = Object.assign({}, config);
    newConfig.avConfig.clamdscan.port = 3311; //fake port
    try {
      const srv = await makeServer(newConfig);
    } catch (e) {
      error = e;
    }
    expect(error.message).toMatch(/Cannot initialize clamav object/i);
    done();
  });
});
