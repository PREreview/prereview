export const processParams = search => {
  const unprocessed = new URLSearchParams(search);
  const processed = new URLSearchParams();
  let page = 1;
  let limit = 10;
  for (const [key, value] of unprocessed) {
    if (key.toLowerCase() === 'search') {
      processed.append('search', value);
    } else if (key.toLowerCase() === 'page') {
      page = value;
    } else if (key.toLowerCase() === 'limit') {
      limit = value;
    } else if (key.toLowerCase() === 'sort') {
      processed.append('sort', value);
    } else if (key.toLowerCase() === 'desc') {
      processed.append('desc', value === 'true');
    } else if (key.toLowerCase() === 'badges') {
      const badges = value ? value.split(',') : [];
      processed.append('badges', badges);
    } else if (key.toLowerCase() === 'tags') {
      const tags = value ? value.split(',') : [];
      processed.append('tags', tags);
    } else if (key.toLowerCase() === 'communities') {
      const communities = value ? value.split(',') : [];
      processed.append('communities', communities);
    } else if (key.toLowerCase() === 'filters') {
      const filters = value ? value.split(',') : [];
      processed.append('filters', filters);
    }
  }

  processed.append('page', page);
  processed.append('limit', limit);
  processed.append('offset', limit * (page - 1));

  return processed;
};

export const searchParamsToObject = params => {
  const obj = {};
  for (const [key, value] of params.entries()) {
    if (key !== 'page') {
      obj[key] = value;
    }
  }
  return obj;
};
