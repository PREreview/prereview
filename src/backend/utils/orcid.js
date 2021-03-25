import orcidUtils from 'orcid-utils';
import fetch from 'node-fetch';
import { createError } from '../../frontend/utils/errors';
import config from '../config.ts';

const ORCID_API_VERSION = 'v3.0';

/**
 * See https://support.orcid.org/hc/en-us/articles/360006897674-Structure-of-the-ORCID-Identifier
 */
export function createRandomOrcid(nTry = 0) {
  const digits = Math.floor(Math.pow(10, 15) * Math.random()).toString();

  let total = 0;
  for (let i = 0; i < digits.length; i++) {
    total = (total + parseInt(digits[i], 10)) * 2;
  }
  const result = (12 - (total % 11)) % 11;
  const checkDigit = result === 10 ? 'X' : result.toString();

  const orcid = `${digits}${checkDigit}`;
  if (!orcidUtils.isValid(orcid) && nTry < 5) {
    return createRandomOrcid(++nTry);
  }

  return orcid;
}

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
