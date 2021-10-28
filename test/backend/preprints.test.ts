import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { createServer } from '../setup';

describe('preprints', () => {
  it('returns a 404 when not found', async () => {
    const response = await request(await createServer()).get(
      '/api/v2/preprints/doi-10.5555-12345678',
    );

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(response.type).toBe('application/json');
    expect(response.body).toStrictEqual({
      message: 'That preprint with ID doi-10.5555-12345678 does not exist.',
      status: 'HTTP 404 Error.',
      statusCode: 404,
    });
  });
});
