import fetch, { RequestInit, Response } from 'node-fetch';
import nullthrows from 'nullthrows';

export type Preprint = {
  doi: string;
  title: string;
  abstract: string;
};

export async function ensurePreprint(data: Preprint | string): Promise<string> {
  let response: Response;

  if (typeof data === 'string') {
    response = await send(`/resolve?identifier=${data}`);
  } else {
    response = await send(`/preprints`, {
      method: 'POST',
      body: JSON.stringify({
        handle: `doi:${data.doi}`,
        title: data.title,
        abstractText: data.abstract,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  return await response.json().then(preprint => preprint.uuid);
}

export async function ensureRequest(preprint: string): Promise<unknown> {
  const requests = await send(`/preprints/${preprint}/requests`)
    .then(response => response.json())
    .then(response => response.data);

  if (requests.length > 0) {
    return;
  }

  return await send(`/preprints/${preprint}/requests`, {
    method: 'POST',
    body: JSON.stringify({ preprint }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

async function send(path: string, init: RequestInit = {}): Promise<Response> {
  return await fetch(`http://prereview:3000/api/v2${path}`, {
    ...init,
    headers: {
      ...init.headers,
      'X-API-App': nullthrows(process.env.TEST_ADMIN_USER_API_APP),
      'X-API-Key': nullthrows(process.env.TEST_ADMIN_USER_API_KEY),
    },
  });
}
