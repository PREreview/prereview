import { Body } from 'node-fetch';

export async function jsonBody<T extends Body>(message: T): Promise<Buffer> {
  return Buffer.from(
    JSON.stringify(await message.json(), jsonReplacer, 2) + '\n',
  );
}

function jsonReplacer(key: string, value: unknown) {
  if (['author', 'createdAt', 'preprint', 'updatedAt', 'uuid'].includes(key)) {
    switch (typeof value) {
      case 'number':
        return 0;
      default:
        return '...';
    }
  }

  return value;
}
