import _ from 'lodash';
import doiRegex from 'doi-regex';
import identifiersArxiv from 'identifiers-arxiv';
import scrape from 'html-metadata';
import { search as scholarSearch } from 'scholarly';
import CrossRef from 'crossref';
import ChainedError from 'typescript-chained-error';
import { getLogger } from '../log';

const log = getLogger('backend:utils:resolve');

type PreprintMetadata = {
  handle: string;
  title: string;
  abstractText?: string;
  url?: string;
  preprintServer?: string;
  authors?: Array<string>;
  datePosted?: string;
  license?: string;
  publication?: string;
  contentUrl?: string;
  contentEncoding?: string;
};

type ScrapeMetadata = {
  general: Record<string, unknown>;
  openGraph: Record<string, unknown>;
  highwirePress: Record<string, unknown>;
};

async function scrapeUrl(
  url: string,
  handle: string,
  handleType: string,
): Promise<PreprintMetadata> {
  log.debug('Attempting to scrape metadata from:', url);
  let res: ScrapeMetadata;
  try {
    res = await scrape({
      url: url,
      headers: { 'User-Agent': 'webscraper' },
    });
  } catch (err) {
    throw new ChainedError('Failed to scrape metadata:', err);
  }

  if (res) {
    log.debug('Raw metadata scrape output:', res);
    const { general, openGraph, highwirePress } = res;
    const authors = [];

    if (
      highwirePress &&
      highwirePress.author &&
      highwirePress.author instanceof Array
    ) {
      highwirePress.author.forEach(author => {
        if (author && author.includes(',')) {
          authors.push(author.replace(',', ''));
        } else {
          authors.push(author);
        }
      });
    } else {
      if (highwirePress.author && highwirePress.author.includes(',')) {
        authors.push(highwirePress.author.replace(',', ''));
      } else {
        authors.push(highwirePress.author);
      }
    }

    const datePosted = highwirePress.online_date
      ? highwirePress.online_date
      : highwirePress.date
      ? highwirePress.date
      : undefined;

    const publication = highwirePress.publisher
      ? highwirePress.publisher
      : undefined;

    let preprintServer =
      openGraph && openGraph.site_name ? openGraph.site_name : undefined;

    if (!preprintServer && publication === 'Preprints') {
      preprintServer = publication;
    }

    const preprint: PreprintMetadata = {
      handle: `${handleType}:${handle}`,
      title: highwirePress.title ? highwirePress.title : undefined,
      abstractText:
        openGraph && openGraph.abstract
          ? openGraph.abstract
          : openGraph && openGraph.description
          ? openGraph.description
          : general && general.description
          ? general.description
          : undefined,
      url: openGraph && openGraph.url ? openGraph.url : undefined,
      preprintServer: preprintServer,
      authors: authors.length > 0 ? authors : undefined,
      datePosted: datePosted
        ? new Date(datePosted as string).toISOString()
        : new Date().toISOString(),
      license: undefined,
      publication: publication,
      contentUrl: highwirePress.pdf_url ? highwirePress.pdf_url : undefined,
      contentEncoding: highwirePress.pdf_url ? 'application/pdf' : undefined,
    };

    return preprint;
  }
}

async function searchGoogleScholar(handle: string): Promise<PreprintMetadata> {
  log.debug('Attempting to scrape Google Scholar for handle:', handle);
  let res;
  try {
    res = await scholarSearch(handle);
  } catch (err) {
    throw new ChainedError('Failed to search Google Scholar:', err);
  }

  if (res.length < 1) {
    log.error(`Preprint ${handle} not found on Google Scholar.`);
    return;
  }
  log.debug('Raw Google Scholar output:', res[0]);
  const contentEncoding =
    res[0].pdf && res[0].pdf.endsWith('.pdf') ? 'application/pdf' : undefined;

  let datePosted: string | undefined;
  if (res[0].year) {
    const date = new Date();
    date.setFullYear(res[0].year);
    datePosted = date.toISOString();
  }
  const metadata = {
    handle: `doi:${handle}`,
    title: res[0].title,
    abstractText: res[0].description,
    url: res[0].url,
    preprintServer: undefined,
    authors: res[0].authors,
    datePosted: datePosted,
    license: undefined,
    publication: res[0].publication,
    contentUrl: res[0].pdf,
    contentEncoding: contentEncoding,
  };
  return metadata;
}

function searchCrossRef(handle: string): Promise<PreprintMetadata> {
  log.debug('Attempting to scrape Crossref for handle:', handle);
  return new Promise((resolve, reject) => {
    CrossRef.work(handle, (err, res) => {
      if (err) {
        reject(new ChainedError('Failed to search CrossRef:', err));
      } else {
        if (!res) {
          log.error(`Preprint ${handle} not found on CrossRef.`);
          reject();
        }
        log.debug('Raw Crossref output:', res);
        const authors = [];

        if (res.author) {
          res.author.forEach(a => authors.push(`${a.given} ${a.family}`));
        }
        const metadata = {
          handle: `doi:${res.DOI}`,
          title: res.title[0],
          abstractText: res.abstract,
          url: res.URL,
          preprintServer: res.institution
            ? res.institution.name
            : res['group-title']
            ? res['group-title']
            : undefined,
          authors: authors,
          datePosted: new Date(res.created['date-time']).toISOString(),
          license: undefined,
          publication: res.publisher,
          contentUrl:
            Array.isArray(res.link) &&
            res.link.length > 0 &&
            res.link[0]['content-type'] !== 'unspecified'
              ? res.link[0].URL
              : undefined,
          contentEncoding:
            Array.isArray(res.link) &&
            res.link.length > 0 &&
            res.link[0]['content-type'] !== 'unspecified'
              ? res.link[0]['content-type']
              : undefined,
        };
        resolve(metadata);
      }
    });
  });
}

export async function resolvePreprint(
  handle: string,
): Promise<PreprintMetadata> {
  log.debug('Resolving preprint with handle:', handle);
  const isDoi = doiRegex().test(handle);
  const isArxiv = identifiersArxiv.extract(handle)[0];
  const resolvers = [];

  const baseUrlArxivHtml = 'https://arxiv.org/abs/';
  const baseUrlDoi = 'https://doi.org/';

  // as a last resort check Google Scholar
  resolvers.push(
    searchGoogleScholar(handle).catch(err =>
      log.error('Not found on Google Scholar: ', err),
    ),
  );

  // check crossref if nothing is found on official sites
  if (isDoi) {
    resolvers.push(
      searchCrossRef(handle).catch(err =>
        log.warn('Not found on CrossRef: ', err),
      ),
    );
  }

  // fetch data based on publication type (DOI / arXiv)
  if (isDoi || isArxiv) {
    // checks if the publication is DOI or arXiv
    let url: string, type: string;
    if (isDoi) {
      log.debug('Resolving preprint with a DOI');
      url = `${baseUrlDoi}${handle}`;
      type = 'doi';
    } else {
      log.debug('Resolving preprint with an arXivId');
      url = `${baseUrlArxivHtml}${handle}`;
      type = 'arxiv';
    }

    resolvers.push(
      scrapeUrl(url, handle, type).catch(err =>
        log.warn('No metadata found via scrape: ', err),
      ),
    );
  }

  const results = await Promise.all(resolvers);
  const metadata: PreprintMetadata = _.merge({}, ...results);
  log.debug('Finalized preprint metadata:', metadata);

  return metadata;
}
