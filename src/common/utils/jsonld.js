export function getId(doc) {
  if (!doc) return doc;
  return typeof doc === 'string' || doc === 'number' ? doc : doc['@id'];
}

export function unprefix(uri = '') {
  return uri.replace(/^.*:/, '');
}
