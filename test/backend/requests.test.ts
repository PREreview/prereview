import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import {
  createApiKey,
  createGroup,
  createPersona,
  createPreprint,
  createRequest,
  createServer,
  createUser,
} from '../setup';

describe('requests', () => {
  it('requires an API key', async () => {
    const preprint = await createPreprint();

    const response = await request(await createServer())
      .post(`/api/v2/preprints/${preprint.uuid}/requests`)
      .send({});

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
    expect(response.type).toBe('application/json');
    expect(response.body).toStrictEqual({
      message:
        "Access Denied - You don't have permission to: access private pages",
    });
  });

  it('can be created', async () => {
    const user = await createUser();
    const apiKey = await createApiKey(user);
    const preprint = await createPreprint();
    const server = await createServer();

    const response = await request(server)
      .post(`/api/v2/preprints/${preprint.uuid}/requests`)
      .set({
        'X-API-App': apiKey.app,
        'X-API-Key': apiKey.secret,
      })
      .send({});

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.type).toBe('application/json');
    expect(response.body).toStrictEqual({
      message: 'created',
      status: StatusCodes.CREATED,
      data: expect.objectContaining({
        author: user.id,
        isPreprintAuthor: false,
        preprint: preprint.id,
      }),
    });
  });

  it("can't be duplicated", async () => {
    const user = await createUser();
    const apiKey = await createApiKey(user);
    const reviewRequest = await createRequest({ author: user.defaultPersona });
    const preprint = reviewRequest.preprint;
    const server = await createServer();

    const response = await request(server)
      .post(`/api/v2/preprints/${preprint.uuid}/requests`)
      .set({
        'X-API-App': apiKey.app,
        'X-API-Key': apiKey.secret,
      })
      .send({});

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
    expect(response.type).toBe('application/json');
    expect(response.body).toStrictEqual({
      error: 'Forbidden',
      message: 'Request already exists',
      statusCode: StatusCodes.FORBIDDEN,
    });
  });

  it("can't be duplicated with a different persona", async () => {
    const user = await createUser();
    const otherPersona = await createPersona(user);
    const apiKey = await createApiKey(user);
    const reviewRequest = await createRequest({ author: otherPersona });
    const preprint = reviewRequest.preprint;
    const server = await createServer();

    const response = await request(server)
      .post(`/api/v2/preprints/${preprint.uuid}/requests`)
      .set({
        'X-API-App': apiKey.app,
        'X-API-Key': apiKey.secret,
      })
      .send({});

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
    expect(response.type).toBe('application/json');
    expect(response.body).toStrictEqual({
      error: 'Forbidden',
      message: 'Request already exists',
      statusCode: StatusCodes.FORBIDDEN,
    });
  });
});

describe('author requests', () => {
  it('are ignored when not a partner', async () => {
    const group = await createGroup('not-partners');
    const user = await createUser(group);
    const apiKey = await createApiKey(user);
    const preprint = await createPreprint();
    const server = await createServer();

    const response = await request(server)
      .post(`/api/v2/preprints/${preprint.uuid}/requests?isAuthor=true`)
      .set({
        'X-API-App': apiKey.app,
        'X-API-Key': apiKey.secret,
      })
      .send({});

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.type).toBe('application/json');
    expect(response.body).toStrictEqual({
      message: 'created',
      status: StatusCodes.CREATED,
      data: expect.objectContaining({
        author: user.id,
        isPreprintAuthor: false,
        preprint: preprint.id,
      }),
    });
  });

  it('can be created by a partner', async () => {
    const group = await createGroup('partners');
    const user = await createUser(group);
    const apiKey = await createApiKey(user);
    const preprint = await createPreprint();
    const server = await createServer();

    const response = await request(server)
      .post(`/api/v2/preprints/${preprint.uuid}/requests?isAuthor=true`)
      .set({
        'X-API-App': apiKey.app,
        'X-API-Key': apiKey.secret,
      })
      .send({});

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.type).toBe('application/json');
    expect(response.body).toStrictEqual({
      message: 'created',
      status: StatusCodes.CREATED,
      data: expect.objectContaining({
        author: user.id,
        isPreprintAuthor: true,
        preprint: preprint.id,
      }),
    });
  });
});
