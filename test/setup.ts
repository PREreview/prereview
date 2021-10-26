import { RequestListener } from 'http';
import configServer from '../src/backend/server';

export async function createServer(config = {}): Promise<RequestListener> {
  return await configServer({
    logLevel: 'off',
    orcidCallbackUrl: 'http://localhost/',
    orcidClientId: 'orcid-client-id',
    ...config,
  });
}
