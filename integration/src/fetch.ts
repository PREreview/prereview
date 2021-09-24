import nodeFetch, { RequestInit, Response } from 'node-fetch';

export * from 'node-fetch';

export type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

export const fetch = (baseURL?: string): Fetch => (path, init?) =>
  nodeFetch(`${baseURL}${path}`, init);
