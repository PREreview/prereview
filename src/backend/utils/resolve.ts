import doiRegex from 'doi-regex';
import identifiersArxiv from 'identifiers-arxiv';
import scrape from 'html-metadata';
import { search as scholarSearch } from 'scholarly';
import CrossRef from 'crossref';
import { getOrcidPerson } from './orcid.js';
import { ChainError } from '../../common/errors';
import { getLogger } from '../log.js';

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
  let res: ScrapeMetadata;
  try {
    res = await scrape({
      url: url,
      headers: { 'User-Agent': 'webscraper' },
    });
  } catch (err) {
    throw new ChainError('Failed to scrape metadata:', err);
  }

  if (res) {
    const { general, openGraph, highwirePress } = res;
    const authors = [];

    if (
      highwirePress &&
      highwirePress.author &&
      highwirePress.author instanceof Array
    ) {
      highwirePress.author.forEach(author => {
        if (author.includes(',')) {
          authors.push(author.replace(',', ''));
        } else {
          authors.push(author);
        }
      });
    } else {
      if (highwirePress.author.includes(',')) {
        authors.push(highwirePress.author.replace(',', ''));
      } else {
        authors.push(highwirePress.author);
      }
    }

    const datePosted = highwirePress.online_date
      ? highwirePress.online_date
      : highwirePress.date
      ? highwirePress.date
      : null;

    const preprint: PreprintMetadata = {
      handle: `${handleType}:${handle}`,
      title: highwirePress.title ? highwirePress.title : null,
      abstractText:
        openGraph && openGraph.abstract
          ? openGraph.abstract
          : openGraph && openGraph.description
          ? openGraph.description
          : general && general.description
          ? general.description
          : null,
      url: openGraph && openGraph.url ? openGraph.url : null,
      preprintServer:
        openGraph && openGraph.site_name
          ? openGraph.site_name
          : highwirePress.public_url
          ? highwirePress.public_url
          : null,
      authors: authors,
      datePosted: datePosted
        ? new Date(datePosted as string).toISOString()
        : null,
      license: null,
      publication: highwirePress.publisher ? highwirePress.publisher : null,
      contentUrl: highwirePress.pdf_url ? highwirePress.pdf_url : null,
      contentEncoding: highwirePress.pdf_url ? 'application/pdf' : null,
    };

    return preprint;
  }
}

async function searchGoogleScholar(handle: string): Promise<PreprintMetadata> {
  let res;
  try {
    res = await scholarSearch(handle);
  } catch (err) {
    throw new ChainError('Failed to search Google Scholar:', err);
  }

  if (res.length < 1) {
    log.error(`Preprint ${handle} not found on Google Scholar.`);
    return;
  }
  const contentEncoding =
    res[0].pdf && res[0].pdf.endsWith('.pdf') ? 'application/pdf' : null;
  const metadata = {
    handle: `doi:${handle}`,
    title: res[0].title,
    abstractText: res[0].description,
    url: res[0].url,
    preprintServer: null,
    authors: res[0].authors,
    datePosted: new Date(res[0].year).toISOString(),
    license: null,
    publication: res[0].publication,
    contentUrl: res[0].pdf,
    contentEncoding: contentEncoding,
  };
  return metadata;
}

function searchCrossRef(handle: string): Promise<PreprintMetadata> {
  return new Promise((resolve, reject) => {
    CrossRef.work(handle, (err, res) => {
      if (err) {
        reject(new ChainError('Failed to search CrossRef:', err));
      } else {
        if (!res) {
          log.error(`Preprint ${handle} not found on CrossRef.`);
          reject();
        }
        const authors = [];

        if (res.author) {
          res.author.forEach(a => authors.push(`${a.given} ${a.family}`));
        }
        const metadata = {
          handle: `doi:${res.DOI}`,
          title: res.title[0],
          abstractText: res.abstract,
          url: res.URL,
          preprintServer: res.institution ? res.institution.name : null,
          authors: authors,
          datePosted: new Date(res.created['date-time']).toISOString(),
          license: null,
          publication: res.publisher,
          contentUrl:
            Array.isArray(res.link) && res.link.length > 0
              ? res.link[0].URL
              : null,
          contentEncoding:
            Array.isArray(res.link) &&
            res.link.length > 0 &&
            res.link[0]['content-type'] !== 'unspecified'
              ? res.link[0]['content-type']
              : null,
        };
        resolve(metadata);
      }
    });
  });
}

export async function resolvePreprint(
  handle: string,
): Promise<PreprintMetadata> {
  const isDoi = doiRegex().test(handle);
  const isArxiv = identifiersArxiv.extract(handle)[0];

  const baseUrlArxivHtml = 'https://arxiv.org/abs/';
  const baseUrlDoi = 'https://doi.org/';

  // checks if the publication is DOI or arXiv
  let url: string, type: string;
  if (isDoi) {
    url = `${baseUrlDoi}${handle}`;
    type = 'doi';
  } else if (isArxiv) {
    url = `${baseUrlArxivHtml}${handle}`;
    type = 'arxiv';
  }

  // fetch data based on publication type (DOI / arXiv)
  let metadata: PreprintMetadata;
  if (isDoi || isArxiv) {
    try {
      metadata = await scrapeUrl(url, handle, type);
    } catch (err) {
      log.warn('No metadata found, failing over to next resolver: ', err);
    }
  }

  // check crossref if nothing is found on official sites
  if (isDoi && !metadata) {
    try {
      metadata = await searchCrossRef(handle);
    } catch (err) {
      log.warn('Not found on CrossRef, failing over to next resolver: ', err);
    }
  }

  // as a last resort check Google Scholar
  if (!metadata) {
    try {
      metadata = await searchGoogleScholar(handle);
    } catch (err) {
      log.error(
        'Not found on Google Scholar, no more resolvers available: ',
        err,
      );
      throw new ChainError('Not found in any resolver.', err);
    }
  }

  return metadata;
}

export async function resolveUser(handle: string): Promise<any> {
  const person = await getOrcidPerson(handle);

  // Process the deep JSON structure for a given ORCID user
  if (person) {
    const persona = {};
    if (person.name) {
      if (person.name['credit-name'] && person.name['credit-name'].value) {
        persona.name = person.name['credit-name'].value;
      } else {
        persona.name =
          person.name['given-names'] && person.name['given-names'].value
            ? person.name['given-names'].value
            : '';
        if (person.name['family-name'] && person.name['family-name'].value) {
          persona.name = persona.name.concat(
            ' ',
            person.name['family-name'].value,
          );
        }
      }
    }

    if (person.biography && person.biography['content']) {
      persona.bio = person.biography['content'];
    }

    const contacts = [];
    if (Array.isArray(person.emails.email) && person.emails.email.length > 0) {
      for (const e of person.emails.email) {
        contacts.push({
          schema: 'mailto',
          value: e.email,
          verified: !!e.verified,
        });
      }
    }
    if (contacts.length > 0) {
      contacts = [...new Set(contacts)];
    }
  }
}
