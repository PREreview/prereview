import fetch, { RequestInit, Response } from 'node-fetch';
import nullthrows from 'nullthrows';
import { z, ZodTypeAny } from 'zod';

const preprintSchema = z.object({
  uuid: z.string(),
});

const dataSchema = <T extends ZodTypeAny>(data: T) =>
  z.object({
    data,
  });

export type Preprint = {
  doi: string;
  title: string;
  abstract: string;
};

export async function ensurePreprint(data: Preprint | string): Promise<string> {
  if (typeof data === 'string') {
    return await send(`/resolve?identifier=${data}`)
      .then(response => response.json())
      .then(preprintSchema.parse)
      .then(preprint => preprint.uuid);
  }

  return await send(`/preprints`, {
    method: 'POST',
    body: JSON.stringify({
      handle: `doi:${data.doi}`,
      title: data.title,
      abstractText: data.abstract,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(dataSchema(preprintSchema).parse)
    .then(preprint => preprint.data.uuid);
}

export async function ensureRequest(preprint: string): Promise<unknown> {
  const requests = await send(`/preprints/${preprint}/requests`)
    .then(response => response.json())
    .then(dataSchema(z.array(z.unknown())).parse)
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
