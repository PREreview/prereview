import { Agent } from 'http';
import nodeFetch, { RequestInit, Response } from 'node-fetch';

export * from 'node-fetch';

export type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

export const fetch = (baseURL?: string, agent?: Agent): Fetch => (
  path,
  init?,
) => nodeFetch(`${baseURL}${path}`, { agent, compress: false, ...init });

export function ensureSuccess<T extends Response>(response: T): T {
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response;
}
