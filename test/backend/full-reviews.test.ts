import faker from 'faker';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import request from 'supertest';
import {
  createApiKey,
  createPreprint,
  createServer,
  createUser,
} from '../setup';

describe('full reviews', () => {
  it('requires admin access', async () => {
    const preprint = await createPreprint();

    const response = await request(await createServer())
      .post('/api/v2/full-reviews')
      .send({
        contents: faker.lorem.paragraphs(),
        isPublished: true,
        preprint: preprint.uuid,
      });

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
    expect(response.type).toBe('application/json');
    expect(response.body).toStrictEqual({
      message:
        "Access Denied - You don't have permission to: access private pages",
    });
  });

  it.skip('fails if a Zenodo deposition cannot be created', async () => {
    const user = await createUser();
    const apiKey = await createApiKey(user);
    const preprint = await createPreprint();

    const server = await createServer();

    nock('https://sandbox.zenodo.org/')
      .post('/api/deposit/depositions')
      .query(true)
      .reply(StatusCodes.SERVICE_UNAVAILABLE, {});

    const createResponse = await request(server)
      .post('/api/v2/full-reviews')
      .set({
        'X-API-App': apiKey.app,
        'X-API-Key': apiKey.secret,
      })
      .send({
        contents: faker.lorem.paragraphs(),
        isPublished: true,
        preprint: preprint.uuid,
      });

    expect(createResponse.status).toBe(StatusCodes.SERVICE_UNAVAILABLE);

    const listResponse = await request(server).get('/api/v2/full-reviews');

    expect(listResponse.status).toBe(StatusCodes.OK);
    expect(listResponse.type).toBe('application/json');
    expect(listResponse.body).toMatchObject({
      totalCount: 0,
    });
  });

  it.skip('fails if a Zenodo deposition cannot be uploaded', async () => {
    const user = await createUser();
    const apiKey = await createApiKey(user);
    const preprint = await createPreprint();
    const depositionId = faker.datatype.uuid();

    const server = await createServer();

    nock('https://sandbox.zenodo.org/')
      .post('/api/deposit/depositions')
      .query(true)
      .reply(StatusCodes.OK, {
        id: depositionId,
      })
      .post(`/api/deposit/depositions/${depositionId}/files`)
      .query(true)
      .reply(StatusCodes.SERVICE_UNAVAILABLE, {});

    const createResponse = await request(server)
      .post('/api/v2/full-reviews')
      .set({
        'X-API-App': apiKey.app,
        'X-API-Key': apiKey.secret,
      })
      .send({
        contents: faker.lorem.paragraphs(),
        isPublished: true,
        preprint: preprint.uuid,
      });

    expect(createResponse.status).toBe(StatusCodes.SERVICE_UNAVAILABLE);

    const listResponse = await request(server).get('/api/v2/full-reviews');

    expect(listResponse.status).toBe(StatusCodes.OK);
    expect(listResponse.type).toBe('application/json');
    expect(listResponse.body).toMatchObject({
      totalCount: 0,
    });
  });

  it.skip('fails if a Zenodo deposition cannot be published', async () => {
    const user = await createUser();
    const apiKey = await createApiKey(user);
    const preprint = await createPreprint();
    const depositionId = faker.datatype.uuid();

    const server = await createServer();

    nock('https://sandbox.zenodo.org/')
      .post('/api/deposit/depositions')
      .query(true)
      .reply(StatusCodes.OK, {
        id: depositionId,
      })
      .post(`/api/deposit/depositions/${depositionId}/files`)
      .query(true)
      .reply(StatusCodes.OK, {})
      .post(`/api/deposit/depositions/${depositionId}/actions/publish`)
      .query(true)
      .reply(StatusCodes.SERVICE_UNAVAILABLE, {});

    const createResponse = await request(server)
      .post('/api/v2/full-reviews')
      .set({
        'X-API-App': apiKey.app,
        'X-API-Key': apiKey.secret,
      })
      .send({
        contents: faker.lorem.paragraphs(),
        isPublished: true,
        preprint: preprint.uuid,
      });

    expect(createResponse.status).toBe(StatusCodes.SERVICE_UNAVAILABLE);

    const listResponse = await request(server).get('/api/v2/full-reviews');

    expect(listResponse.status).toBe(StatusCodes.OK);
    expect(listResponse.type).toBe('application/json');
    expect(listResponse.body).toMatchObject({
      totalCount: 0,
    });
  });
});
