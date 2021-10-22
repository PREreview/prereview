import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { createServer } from '../setup';

describe('api-docs', () => {
  it('resolves successfully', async () => {
    const response = await request(await createServer()).get('/api/docs');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.type).toBe('text/html');
  });
});
