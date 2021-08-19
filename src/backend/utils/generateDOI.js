import fetch from 'node-fetch';
import { getLogger } from '../log.js';
import FormData from 'form-data';
import config from '../config.ts';

const log = getLogger('backend:utils:generateDOI');

const BASE_URL = config.zenodoSandbox
  ? 'https://sandbox.zenodo.org'
  : 'https://zenodo.org';

const zenodoBaseUrl = (action = '') =>
  `${BASE_URL}/api/deposit/depositions${action}?access_token=${
    config.zenodoToken
  }`;

const zenodoPayload = (body = {}, headers = {}) => ({
  method: 'POST',
  body,
  headers: { 'content-type': 'application/json', ...headers },
});

export default async function generateDOI(prereviewData) {
  // shaping required metadata as
  // laid out in https://developers.zenodo.org/#depositions
  const data = {
    metadata: {
      upload_type: 'publication',
      publication_type: 'article',
      title: prereviewData.title,
      description: prereviewData.content || 'No content.',
      creators: prereviewData.creators,
    },
  };

  // Create a deposition
  const depositionUrl = zenodoBaseUrl();
  const depositionPayload = zenodoPayload(JSON.stringify(data));
  const depositionRes = await fetch(depositionUrl, depositionPayload);
  const depositionData = await depositionRes.json();

  // Check if we have a valid deposition id
  if (!depositionData.id) {
    console.error(depositionData);
    throw new Error('Missing Zenodo deposition id');
  }

  // Review deposition file
  const formData = new FormData();
  const fileName = prereviewData.title
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();
  const buffer = Buffer.from(prereviewData.content, 'utf8');
  formData.append('file', buffer, {
    contentType: 'text/html',
    name: 'file',
    filename: `${fileName}_${Date.now()}.html`,
  });

  // Upload the deposition file
  const uploadAction = `/${depositionData.id}/files`;
  const uploadUrl = zenodoBaseUrl(uploadAction);
  const uploadPayload = zenodoPayload(formData, formData.getHeaders());
  const uploadRes = await fetch(uploadUrl, uploadPayload);
  const uploadData = await uploadRes.json();

  let publishData;

  // Publish the deposition
  if (uploadData) {
    const publishAction = `/${depositionData.id}/actions/publish`;
    const publishUrl = zenodoBaseUrl(publishAction);
    const publishPayload = zenodoPayload();
    const publishRes = await fetch(publishUrl, publishPayload);
    publishData = await publishRes.json();
  }

  // Check if we have a valid DOI
  if (!publishData.doi) {
    throw new Error('Missing DOI in publish data');
  }

  // Success
  log.debug(`
    [ZENODO] Deposition published successfully!
    > Deposition: ${BASE_URL}/deposit/${depositionData.id}
    > Record: ${BASE_URL}/record/${publishData.doi.split('zenodo.')[1]}
  `);

  log.debug(`DOI************`, publishData);
  return publishData.doi;
}
