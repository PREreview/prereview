import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { Preprint } from './entities';
import ChainedError from 'typescript-chained-error';
import { getLogger } from '../log';

const log = getLogger('backend:model:preprints');

export class PreprintModel extends EntityRepository<Preprint> {
  async findOneByUuidOrHandle(value: string, params: string[]): Promise<Preprint> {
    try {
      const { id, scheme } = decodePreprintId(value);
      return this.findOne({ handle: `${scheme}:${id}` }, params);
    } catch (err) {
      log.warn('Failed to extract handle, trying as a uuid');
    }
    try {
      return this.findOne({ uuid: value }, params);
    } catch (err) {
      throw new ChainedError(`'${value}' is not a valid UUID or Handle`);
    }
  }
}

export function preprintModelWrapper(db: MikroORM): PreprintModel {
  return db.em.getRepository(Preprint);
}

function decodePreprintId(value: string) {
  let scheme;
  if (value.startsWith('doi-')) {
    scheme = 'doi' as const;
  } else if (value.startsWith('arxiv')) {
    scheme = 'arxiv' as const;
  }

  if (!scheme) {
    throw new ChainedError(
      'String is not an encoded preprint ID (could not extract scheme)',
    );
  }

  return {
    id: `${value.slice(value.indexOf('-') + 1).replace(/-/g, '/').replace(/\+/g, '-')}`,
    scheme: scheme,
  };
}
