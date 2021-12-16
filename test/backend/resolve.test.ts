import faker from 'faker';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import request from 'supertest';
import { createPreprint, createServer } from '../setup';
import { fakeDoi, isoDateTime, uuid } from '../utils';

describe('resolve', () => {
  it('returns basic details from Crossref', async () => {
    const created = faker.date.past();
    const doi = fakeDoi();
    const title = faker.lorem.sentence();

    nock('https://api.crossref.org/')
      .get(`/works/${doi}`)
      .reply(StatusCodes.OK, {
        status: 'ok',
        message: {
          DOI: doi,
          created: {
            'date-time': created.toISOString(),
          },
          title: [title],
        },
      });

    const response = await request(await createServer())
      .get('/api/v2/resolve')
      .query({ identifier: doi });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.type).toBe('application/json');
    expect(response.body).toStrictEqual({
      authors: '',
      communities: [],
      createdAt: expect.stringMatching(isoDateTime),
      datePosted: created.toISOString(),
      fullReviews: [],
      handle: `doi:${doi}`,
      isPublished: false,
      rapidReviews: [],
      requests: [],
      tags: [],
      title: title,
      updatedAt: expect.stringMatching(isoDateTime),
      uuid: expect.stringMatching(uuid),
    });
  });

  it('returns already-known preprints', async () => {
    const preprint = await createPreprint({ handle: 'doi:10.5555/abcdef' });

    const response = await request(await createServer())
      .get('/api/v2/resolve')
      .query({ identifier: '10.5555/abcdef' });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.type).toBe('application/json');
    expect(response.body).toMatchObject({ uuid: preprint.uuid });
  });

  it('treats DOIs as case insensitive', async () => {
    const preprint = await createPreprint({ handle: 'doi:10.5555/abcdef' });

    const response = await request(await createServer())
      .get('/api/v2/resolve')
      .query({ identifier: '10.5555/AbCdEf' });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.type).toBe('application/json');
    expect(response.body).toMatchObject({ uuid: preprint.uuid });
  });
});
