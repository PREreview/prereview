import { expect, test } from './test';
import { jsonBody } from './utils';

test.asAnAuthenticatedAPIUser(
  'can submit a rapid review',
  async ({ apiFetch, preprint }) => {
    const response = await apiFetch(`/api/v2/rapid-reviews`, {
      method: 'POST',
      body: JSON.stringify({
        preprint: preprint.uuid,
        ynNovel: 'N/A',
        ynFuture: 'N/A',
        ynReproducibility: 'N/A',
        ynMethods: 'N/A',
        ynCoherent: 'N/A',
        ynLimitations: 'N/A',
        ynEthics: 'N/A',
        ynNewData: 'N/A',
        ynAvailableData: 'N/A',
        ynAvailableCode: 'N/A',
        ynRecommend: 'N/A',
        ynPeerReview: 'N/A',
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
  'not allowed to submit a rapid review',
  async ({ fetch, preprint }) => {
    const response = await fetch(`/api/v2/rapid-reviews`, {
      method: 'POST',
      body: JSON.stringify({
        preprint: preprint.uuid,
        ynNovel: 'N/A',
        ynFuture: 'N/A',
        ynReproducibility: 'N/A',
        ynMethods: 'N/A',
        ynCoherent: 'N/A',
        ynLimitations: 'N/A',
        ynEthics: 'N/A',
        ynNewData: 'N/A',
        ynAvailableData: 'N/A',
        ynAvailableCode: 'N/A',
        ynRecommend: 'N/A',
        ynPeerReview: 'N/A',
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
  'not allowed to submit multiple rapid reviews',
  async ({ apiFetch, preprint, rapidReview }, { fixme }) => {
    const response = await apiFetch(`/api/v2/rapid-reviews`, {
      method: 'POST',
      body: JSON.stringify({
        preprint: preprint.uuid,
        ynNovel: 'N/A',
        ynFuture: 'N/A',
        ynReproducibility: 'N/A',
        ynMethods: 'N/A',
        ynCoherent: 'N/A',
        ynLimitations: 'N/A',
        ynEthics: 'N/A',
        ynNewData: 'N/A',
        ynAvailableData: 'N/A',
        ynAvailableCode: 'N/A',
        ynRecommend: 'N/A',
        ynPeerReview: 'N/A',
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
