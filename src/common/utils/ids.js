import orcidUtils from 'orcid-utils';
import doiRegex from 'doi-regex';
import identifiersArxiv from 'identifiers-arxiv';
import { getId, unprefix } from './jsonld';
import { ChainError } from '../errors.ts';

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
      throw new ChainError('Invalid identifier for create preprint id');
    }
  }

  if (id.startsWith('preprint:')) {
    return id;
  }

  let vendor;
  if (id.toLowerCase().startsWith('doi:')) {
    vendor = 'doi';
  } else if (id.toLowerCase().startsWith('arxiv:')) {
    vendor = 'arxiv';
  } else if (doiRegex().test(id)) {
    vendor = 'doi';
  } else if (identifiersArxiv.extract(id)[0]) {
    vendor = 'arxiv';
  }

  if (!vendor) {
    throw new ChainError(
      'Invalid identifier for create preprint id (could not extract vendor)',
    );
  }

  return `${vendor}-${unprefix(id).replace(/\//g, '-')}`;
}

export function decodePreprintId(value) {
  if (!value) {
    throw new ChainError('You must provide a preprintId to decode');
  }

  let scheme;
  if (value.startsWith('doi-')) {
    scheme = 'doi';
  } else if (value.startsWith('arxiv')) {
    scheme = 'arxiv';
  }

  if (!scheme) {
    throw new ChainError(
      'String is not an encoded preprint ID (could not extract scheme)',
    );
  }

  return {
    id: `${value.slice(value.indexOf('-') + 1).replace(/-/g, '/')}`,
    scheme: scheme,
  };
}

export function createPreprintIdentifierCurie(
  value, // preprint or identifer (arXivId or DOI, unprefixed)
) {
  if (!value) {
    throw new ChainError('invalid value for createIdentifierCurie');
  }

  if (value.doi) {
    return `doi:${value.doi}`;
  } else if (value.arXivId) {
    return `arXiv:${value.arXivId}`;
  } else {
    const id = getId(value);
    if (!id) {
      throw new ChainError('invalid value for createIdentifierCurie');
    }

    if (doiRegex().test(id)) {
      return `doi:${value.doi}`;
    } else if (identifiersArxiv.extract(id)[0]) {
      return `arXiv:${value.arXivId}`;
    } else {
      throw new ChainError('invalid value for createIdentifierCurie');
    }
  }
}

export function getCanonicalDoiUrl(doi) {
  return `https://doi.org/${unprefix(doi)}`;
}

export function getCanonicalArxivUrl(arXivId) {
  return `https://arxiv.org/abs/${unprefix(arXivId)}`;
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

export function createUserId(orcid) {
  return `${orcidUtils.toDashFormat(unprefix(orcid))}`;
}

export function createRandomDoi() {
  return (
    '10.' +
    (Math.floor(Math.random() * 10000) + 10000).toString().substring(1) +
    '/' +
    (Math.floor(Math.random() * 1000) + 1000).toString().substring(1)
  );
}

export function createRandomArxivId() {
  return (
    'arXiv:' +
    String(Math.floor(Math.random() * 93) + 7).padStart(2, '0') +
    String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') +
    '.' +
    (Math.floor(Math.random() * 10000) + 10000).toString().substring(1) +
    'v' +
    String(Math.floor(Math.random() * 9) + 1)
  );
}
