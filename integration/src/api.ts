import fetch, { RequestInit, Response } from 'node-fetch';

export async function ensurePreprint(doi: string): Promise<string> {
  return send(`/resolve?identifier=${doi}`)
    .then(response => response.json())
    .then(preprint => preprint.uuid);
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
      'X-API-App': process.env.TEST_ADMIN_USER_API_APP,
      'X-API-Key': process.env.TEST_ADMIN_USER_API_KEY,
    },
  });
}
