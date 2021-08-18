import doiRegex from 'doi-regex';
import identifiersArxiv from 'identifiers-arxiv';
import { getId, unprefix } from '../utils/jsonld';
import { createError } from './errors';

export function createPreprintId(
  value, // doi or arXiv (prefixed or not) or preprint
) {
  let id = getId(value);

  if (!id) {
    // value may be a preprint
    if (value) {
      id = value.doi || value.arXivId;
    }
    if (!id) {
      throw createError(500, `invalid identifier for create preprint id`);
    }
  }

  if (id.startsWith('preprint:')) {
    return id;
  }

  let vendor;
  if (id.startsWith('doi:')) {
    vendor = 'doi';
  } else if (id.startsWith('arXiv:')) {
    vendor = 'arxiv';
  } else if (doiRegex().test(id)) {
    vendor = 'doi';
  } else if (identifiersArxiv.extract(id)[0]) {
    vendor = 'arxiv';
  }

  if (!vendor) {
    throw createError(
      500,
      `invalid identifier for create preprint id (could not extract vendor)`,
    );
  }

  return `preprint:${vendor}-${unprefix(id).replace('/', '-')}`;
}

/**
 * biorXiv adds some vX suffix to doi but do not register them with doi.org
 * => here we remove the vX part
 */
export function unversionDoi(doi = '') {
  const doiMatch = doi.match(doiRegex());
  if (doiMatch) {
    const doi = doiMatch[0];
    return doi.replace(/v\d+$/, '');
  }

  return null;
}
