import orcidUtils from 'orcid-utils';
import fetch from 'node-fetch';
import { HttpError } from '../errors.ts';

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
export async function getOrcidProfile(orcid, token) {
  const r = await fetch(`https://pub.orcid.org/v2.1/${orcid}/person`, {
    headers: {
      Accept: 'application/json',
      Authorization: `${token.tokenType} ${token.accessToken}`,
    },
  });

  if (r.ok) {
    return await r.json();
  } else {
    throw new HttpError(r.status, `Failed to fetch profile for ORCID ${orcid}`);
  }
}
