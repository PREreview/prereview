export function getId(doc) {
  if (!doc) return doc;
  return typeof doc === 'string' || doc === 'number' ? doc : doc['@id'];
}

export function unprefix(uri = '') {
  if (uri && typeof uri === 'string') {
    return uri.replace(/^.*:/, '');
  } else {
    return uri;
  }
}

export function arrayify(value) {
  if (value === undefined) return [];
  if (value) {
    value = value['@list'] || value['@set'] || value;
  }
  return Array.isArray(value) ? value : [value];
}
