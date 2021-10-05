import nullthrows from 'nullthrows';
import { z, ZodTypeAny } from 'zod';
import { Fetch, ensureSuccess } from './fetch';

export type AuthHeaders = {
  'X-API-App': string;
  'X-API-Key': string;
};

const adminHeaders: AuthHeaders = {
  'X-API-App': nullthrows(process.env.TEST_ADMIN_USER_API_APP),
  'X-API-Key': nullthrows(process.env.TEST_ADMIN_USER_API_KEY),
};

const apiKeySchema = z.object({
  app: z.string(),
  secret: z.string(),
});

const communitySchema = z.object({
  uuid: z.string(),
  name: z.string(),
  slug: z.string(),
});

const personaSchema = z.object({
  uuid: z.string(),
});

const preprintSchema = z.object({
  uuid: z.string(),
  handle: z.string(),
  title: z.string(),
  abstractText: z.string(),
});

const fullReviewSchema = z.object({
  uuid: z.string(),
  doi: z.string(),
});

const rapidReviewSchema = z.object({
  uuid: z.string(),
});

const templateSchema = z.object({
  uuid: z.string(),
  title: z.string(),
  contents: z.string(),
});

const userSchema = z.object({
  uuid: z.string(),
  orcid: z.string(),
  defaultPersona: personaSchema,
});

const dataSchema = <T extends ZodTypeAny>(data: T) =>
  z.object({
    data,
  });

const bodySchema = <T extends ZodTypeAny>(body: T) =>
  z.object({
    body,
  });

export type ApiKey = z.infer<typeof apiKeySchema>;

export type Community = z.infer<typeof communitySchema>;

export type FullReview = z.infer<typeof fullReviewSchema>;

export type Preprint = z.infer<typeof preprintSchema>;

export type RapidReview = z.infer<typeof rapidReviewSchema>;

export type Template = z.infer<typeof templateSchema>;

export type User = z.infer<typeof userSchema>;

export async function ensurePreprint(
  fetch: Fetch,
  data: Omit<Preprint, 'uuid'> | string,
): Promise<Preprint> {
  if (typeof data === 'string') {
    return await fetch(`/api/v2/resolve?identifier=${data}`, {
      headers: adminHeaders,
    })
      .then(response => response.json())
      .then(preprintSchema.parse);
  }

  return await fetch(`/api/v2/preprints`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      ...adminHeaders,
    },
  })
    .then(ensureSuccess)
    .then(response => response.json())
    .then(dataSchema(preprintSchema).parse)
    .then(response => response.data);
}

export async function ensureRequest(
  fetch: Fetch,
  preprint: string,
): Promise<unknown> {
  const requests = await fetch(`/api/v2/preprints/${preprint}/requests`, {
    headers: adminHeaders,
  })
    .then(response => response.json())
    .then(dataSchema(z.array(z.unknown())).parse)
    .then(response => response.data);

  if (requests.length > 0) {
    return;
  }

  return await fetch(`/api/v2/preprints/${preprint}/requests`, {
    method: 'POST',
    body: JSON.stringify({ preprint }),
    headers: {
      'Content-Type': 'application/json',
      ...adminHeaders,
    },
  }).then(ensureSuccess);
}

export async function ensureFullReview(
  fetch: Fetch,
  preprint: string,
  authHeaders?: AuthHeaders,
): Promise<FullReview> {
  return await fetch(`/api/v2/full-reviews`, {
    method: 'POST',
    body: JSON.stringify({
      preprint,
      contents: 'This is a full review.',
      isPublished: true,
      authors: null,
    }),
    headers: {
      'Content-Type': 'application/json',
      ...(authHeaders || adminHeaders),
    },
  })
    .then(ensureSuccess)
    .then(response => response.json())
    .then(bodySchema(fullReviewSchema).parse)
    .then(response => response.body);
}

export async function ensureRapidReview(
  fetch: Fetch,
  preprint: string,
  authHeaders?: AuthHeaders,
): Promise<RapidReview> {
  return await fetch(`/api/v2/rapid-reviews`, {
    method: 'POST',
    body: JSON.stringify({
      preprint,
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
      ...(authHeaders || adminHeaders),
    },
  })
    .then(ensureSuccess)
    .then(response => response.json())
    .then(dataSchema(z.array(rapidReviewSchema)).parse)
    .then(response => response.data[0]);
}

export async function ensureCommunity(
  fetch: Fetch,
  community: Omit<Community, 'uuid'>,
): Promise<Community> {
  const foundCommunity = await findCommunity(fetch, community.slug);

  if (foundCommunity) {
    return foundCommunity;
  }

  return await fetch(`/api/v2/communities`, {
    method: 'POST',
    body: JSON.stringify({
      ...community,
      owners: [],
    }),
    headers: {
      'Content-Type': 'application/json',
      ...adminHeaders,
    },
  })
    .then(ensureSuccess)
    .then(response => response.json())
    .then(dataSchema(z.array(communitySchema)).parse)
    .then(response => response.data[0]);
}

export async function ensureCommunityMember(
  fetch: Fetch,
  community: string,
  persona: string,
): Promise<unknown> {
  return await fetch(`/api/v2/communities/${community}/members/${persona}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...adminHeaders,
    },
  }).then(ensureSuccess);
}

export async function ensureCommunityModerator(
  fetch: Fetch,
  community: string,
  persona: string,
): Promise<unknown> {
  await ensureCommunityMember(fetch, community, persona);

  return await fetch(`/api/v2/communities/${community}/owners/${persona}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...adminHeaders,
    },
  }).then(ensureSuccess);
}

export async function ensureTemplate(
  fetch: Fetch,
  community: string,
  template: Omit<Template, 'uuid'>,
): Promise<Template> {
  return await fetch(`/api/v2/communities/${community}/templates`, {
    method: 'POST',
    body: JSON.stringify(template),
    headers: {
      'Content-Type': 'application/json',
      ...adminHeaders,
    },
  })
    .then(ensureSuccess)
    .then(response => response.json())
    .then(dataSchema(templateSchema).parse)
    .then(response => response.data);
}

export async function ensureApiKey(
  fetch: Fetch,
  user: string,
): Promise<ApiKey> {
  const keys = await fetch(`/api/v2/users/${user}`, {
    headers: adminHeaders,
  })
    .then(response => response.json())
    .then(dataSchema(z.object({ keys: z.array(apiKeySchema) })).parse)
    .then(response => response.data.keys);

  if (keys.length > 0) {
    return keys[0];
  }

  return await fetch(`/api/v2/users/${user}/keys`, {
    method: 'POST',
    body: JSON.stringify({ app: 'My App' }),
    headers: {
      'Content-Type': 'application/json',
      ...adminHeaders,
    },
  })
    .then(ensureSuccess)
    .then(response => response.json())
    .then(dataSchema(apiKeySchema).parse)
    .then(response => response.data);
}

export async function findCommunity(
  fetch: Fetch,
  slug: string,
): Promise<Community | undefined> {
  return await fetch(`/api/v2/communities`, {
    headers: adminHeaders,
  })
    .then(response => response.json())
    .then(dataSchema(z.array(communitySchema)).parse)
    .then(response => response.data.find(community => community.slug === slug));
}

export async function findUser(
  fetch: Fetch,
  orcid: string,
): Promise<User | undefined> {
  return await fetch(`/api/v2/users`, {
    headers: adminHeaders,
  })
    .then(response => response.json())
    .then(dataSchema(z.array(userSchema)).parse)
    .then(response => response.data.find(user => user.orcid === orcid));
}
