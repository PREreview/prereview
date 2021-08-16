import { ensurePreprint, ensureRequest } from './api';

export default async function globalSetup(): Promise<void> {
  await ensurePreprint('10.5555/12345678').then(ensureRequest);
}
