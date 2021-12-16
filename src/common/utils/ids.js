import doiRegex from 'doi-regex';
import identifiersArxiv from 'identifiers-arxiv';
import ChainedError from 'typescript-chained-error';

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
      throw new ChainedError('Invalid identifier for create preprint id');
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
    throw new ChainedError(
      'Invalid identifier for create preprint id (could not extract vendor)',
    );
  }

  return `${vendor}-${unprefix(id).replace(/-/g, '+').replace(/\//g, '-')}`;
}

function getId(doc) {
  if (!doc) return doc;
  return typeof doc === 'string' || doc === 'number' ? doc : doc['@id'];
}

function unprefix(uri = '') {
  return uri.replace(/^.*:/, '');
}
