import fetch from 'node-fetch';
import { createError } from '../utils/http-errors.ts';
import config from '../config.ts';
import { Work } from '../models/entities/index.ts';
const ORCID_API_VERSION = 'v3.0';

/**
 * See https://members.orcid.org/api/tutorial/read-orcid-records
 */
async function getOrcidData(orcid, endpoint, token) {
  const headers = { Accept: 'application/json' };
  if (token) {
    headers.Authorization = `${token.tokenType} ${token.accessToken}`;
  }
  const url = config.orcidSandbox
    ? `https://api.sandbox.orcid.org/${ORCID_API_VERSION}/${orcid}/${endpoint}`
    : `https://pub.orcid.org/${ORCID_API_VERSION}/${orcid}/${endpoint}`;

  const r = await fetch(url, {
    headers: headers,
  });

  if (r.ok) {
    return await r.json();
  } else {
    throw createError(r.status);
  }
}

export async function getOrcidPerson(orcid, token) {
  return getOrcidData(orcid, 'person', token);
}

export async function getOrcidWorks(orcid, token) {
  return getOrcidData(orcid, 'works', token);
}

export function processWorks(works, user) {
  // Process the deep JSON structure for a given ORCID user's published works
  for (let w of works.group) {
    if (Array.isArray(w['work-summary']) && w['work-summary'].length) {
      let title;
      if (
        w['work-summary'][0].title &&
        w['work-summary'][0].title.title &&
        w['work-summary'][0].title.title.value
      ) {
        title = w['work-summary'][0].title.title.value;
      }
      const work = new Work(title, user);
      if (w['work-summary'][0].url && w['work-summary'][0].url.value) {
        work.url = w['work-summary'][0].url.value;
      }
      if (
        w['work-summary'][0]['external-ids'] &&
        Array.isArray(w['work-summary'][0]['external-ids']['external-id']) &&
        w['work-summary'][0]['external-ids']['external-id'].length > 0
      ) {
        work.handle = `${
          w['work-summary'][0]['external-ids']['external-id'][0][
            'external-id-type'
          ]
        }:${
          w['work-summary'][0]['external-ids']['external-id'][0][
            'external-id-value'
          ]
        }`;
      }
      if (w['work-summary'][0].type) {
        work.type = w['work-summary'][0].type;
      }
      if (
        w['work-summary'][0]['publication-date'] &&
        w['work-summary'][0]['publication-date'].year &&
        w['work-summary'][0]['publication-date'].year.value
      ) {
        let dateString = w['work-summary'][0]['publication-date'].year.value;
        if (
          w['work-summary'][0]['publication-date'].month &&
          w['work-summary'][0]['publication-date'].month.value
        ) {
          dateString = dateString.concat(
            '-',
            w['work-summary'][0]['publication-date'].month.value,
          );
        }
        if (
          w['work-summary'][0]['publication-date'].day &&
          w['work-summary'][0]['publication-date'].day.value
        ) {
          dateString = dateString.concat(
            '-',
            w['work-summary'][0]['publication-date'].day.value,
          );
        }
        let publicationDate = new Date(dateString);
        work.publicationDate = !isNaN(publicationDate)
          ? publicationDate
          : undefined;
      }
      if (
        w['work-summary'][0]['journal-title'] &&
        w['work-summary'][0]['journal-title'].value
      ) {
        work.publisher = w['work-summary'][0]['journal-title'].value;
      }
      user.works.add(work);
    }
  }
}
