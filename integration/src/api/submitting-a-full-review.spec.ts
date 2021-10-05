import { expect, test } from './test';
import { jsonBody } from './utils';

test.asAnAuthenticatedAPIUser(
  'can submit a full review',
  async ({ apiFetch, preprint }) => {
    const response = await apiFetch(`/api/v2/full-reviews`, {
      method: 'POST',
      body: JSON.stringify({
        preprint: preprint.uuid,
        contents: 'This is a full review.',
        isPublished: true,
        authors: null,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(201);
    expect(await jsonBody(response)).toMatchSnapshot('success.json');
  },
);

test.asAnAnonymousAPIUser(
  'not allowed to submit a full review',
  async ({ fetch, preprint }) => {
    const response = await fetch(`/api/v2/full-reviews`, {
      method: 'POST',
      body: JSON.stringify({
        preprint: preprint.uuid,
        contents: 'This is a full review.',
        isPublished: true,
        authors: null,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(403);
    expect(await jsonBody(response)).toMatchSnapshot('no-api-key.json');
  },
);

test.asAnAuthenticatedAPIUser(
  'not allowed to submit multiple full reviews',
  async ({ apiFetch, fullReview, preprint }, { fixme }) => {
    const response = await apiFetch(`/api/v2/full-reviews`, {
      method: 'POST',
      body: JSON.stringify({
        preprint: preprint.uuid,
        contents: 'This is another full review.',
        isPublished: true,
        authors: null,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    fixme(true, 'A successful response is returned');

    expect(response.status).toBe(403);
    expect(await jsonBody(response)).toMatchSnapshot('duplicate.json');
  },
);
