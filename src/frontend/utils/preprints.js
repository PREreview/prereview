import { format } from 'date-fns';
import { unprefix } from '../utils/jsonld';

export function getCanonicalUrl(preprint = {}) {
  if (!preprint) return preprint;

  if (preprint.url) {
    return preprint.url;
  } else if (preprint.doi) {
    return `https://doi.org/${unprefix(preprint.doi)}`;
  } else if (preprint.arXivId) {
    return `https://arxiv.org/abs/${unprefix(preprint.arXivId)}`;
  }
}

/**
 * Used to avoid converting date posted to user locale
 */
export function getFormattedDatePosted(isoString) {
  isoString = isoString ? isoString : new Date().toISOString();
  const [year, month, day] = isoString.substr(0, 10).split('-');
  return format(new Date(year, month - 1, day), 'yyyy/MM/dd');
}
