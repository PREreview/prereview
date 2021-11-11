import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import {
  createApiKey,
  createPreprint,
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
    });

    const listResponse = await request(server).get(
      `/api/v2/preprints/${preprint.uuid}/requests`,
    );

    expect(listResponse.status).toBe(StatusCodes.OK);
    expect(listResponse.type).toBe('application/json');
    expect(listResponse.body).toMatchObject({
      data: [
        {
          author: user.id,
          isPreprintAuthor: false,
          preprint: preprint.id,
        },
      ],
    });
  });
});
