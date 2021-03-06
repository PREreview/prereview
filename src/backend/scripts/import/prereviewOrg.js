import _ from 'lodash';
import {
  badgeModelWrapper,
  fullReviewModelWrapper,
  personaModelWrapper,
  preprintModelWrapper,
  requestModelWrapper,
  tagModelWrapper,
  userModelWrapper,
} from '../../models/index.ts';
import { Client } from 'pg';
import anonymus from 'anonymus';
import { resolvePreprint } from '../../utils/resolve.ts';
import { getOrcidPerson, getOrcidWorks } from '../../utils/orcid.js';
import {
  Contact,
  FullReview,
  FullReviewDraft,
  Preprint,
  Request,
  Work,
} from '../../models/entities/index.ts';

async function importPreprints(
  site,
  preprints,
  preprintModel,
  preprintsMap,
  preTag,
) {
  try {
    const preprintCache = new Set();
    for (let r of preprints.rows) {
      r.createdAt = new Date(r.createdAt);
      r.datePosted = new Date(r.datePosted);
      let handle, lookup;
      if (r.handle.startsWith('doi/')) {
        handle = r.handle.replace(/^doi\//, '');
        handle = handle.replace(/^https:\/\/doi.org\//, '');
        lookup = await resolvePreprint(handle);
        handle = `doi:${handle}`;
      } else if (r.handle.startsWith('arxiv/')) {
        handle = r.handle.replace(/^arxiv\//, '');
        lookup = await resolvePreprint(handle);
        handle = `arxiv:${handle}`;
      } else if (r.handle.startsWith('arXivId:')) {
        handle = r.handle.replace(/^arXivId:/, '');
        lookup = await resolvePreprint(handle);
        handle = `arxiv:${handle}`;
      } else if (r.handle.startsWith('doi:') || r.handle.startsWith('arxiv:')) {
        handle = r.handle.replace(/^.*:/, '');
        lookup = await resolvePreprint(handle);
        handle = r.handle;
      } else {
        console.log('ERROR');
      }
      let preprint = await preprintModel.findOne({ handle: handle });
      if (!preprint && !preprintCache.has(handle)) {
        let source;
        if (lookup) {
          source = lookup;
        } else {
          console.warn(`${site}: Failed to lookup preprint, using data as-is`);
          source = r;
        }
        preprint = new Preprint(
          handle,
          source.title,
          true,
          source.abstractText,
          source.preprintServer,
          source.datePosted,
          source.license,
          source.publication,
          source.url,
          source.contentEncoding,
          source.contentUrl,
        );
        preprint.tags.add(preTag);
        preprintModel.persist(preprint);
        console.log(`${site}: Inserted Preprint ${preprint.handle}`);
      } else {
        console.log(`${site}: Duplicate preprint ${handle}, skipping`);
      }
      preprintCache.add(handle);
      preprintsMap.set(r.handle, preprint);
    }
    console.log(`${site}: Flushing preprints to disk.`);
    await preprintModel.flush();
    console.log(`${site}: Done flushing preprints to disk.`);
  } catch (err) {
    console.error('Failed to import:', err);
  }
}

async function prereviewOrgImportPreprints(db, client, preprintsMap, preTag) {
  const preprintModel = preprintModelWrapper(db);
  let oldPreprints;
  try {
    oldPreprints = await client.query(
      'SELECT id AS handle,title,date_created AS "createdAt",source AS url,publisher AS "preprintServer",date_published AS "datePosted" FROM preprints',
    );
  } catch (err) {
    console.error('PREreview.org: Failed to query legacy database:', err);
  }
  if (oldPreprints) {
    try {
      await importPreprints(
        'PREreview.org',
        oldPreprints,
        preprintModel,
        preprintsMap,
        preTag,
      );
    } catch (err) {
      console.error('PREreview.org: Failed to import preprints:', err);
    }
  } else {
    console.error('PREreview.org: Failed to query legacy database');
  }
}

async function prereviewOrgImportUsers(db, client, usersMap, preBadge) {
  const userModel = userModelWrapper(db);
  const personaModel = personaModelWrapper(db);
  const userCache = new Set();
  const personaCache = new Set();
  try {
    const oldUsers = await client.query(
      'SELECT user_id,orcid,name,created_at AS "createdAt",profile FROM users',
    );
    console.log('PREreview.org: Queried user database');

    for (let r of oldUsers.rows) {
      r.createdAt = new Date(r.createdAt);
      let person, works;
      try {
        person = await getOrcidPerson(r.orcid);
      } catch (err) {
        console.log('PREreview.org: Failed to fetch ORCID person:', err);
      }
      try {
        works = await getOrcidWorks(r.orcid);
      } catch (err) {
        console.log('PREreview.org: Failed to fetch ORCID works:', err);
      }

      // Process the deep JSON structure for a given ORCID user
      let userObject;
      if (person) {
        userObject = userModel.create({ orcid: r.orcid });
        userCache.add(r.orcid);
        //userObject.createdAt = new Date(r.createdAt);
        let name;
        if (person.name) {
          if (person.name['credit-name'] && person.name['credit-name'].value) {
            name = person.name['credit-name'].value;
          } else {
            name =
              person.name['given-names'] && person.name['given-names'].value
                ? person.name['given-names'].value
                : '';
            if (
              person.name['family-name'] &&
              person.name['family-name'].value
            ) {
              name = name.concat(' ', person.name['family-name'].value);
            }
          }
        } else {
          name = r.name;
        }
        let personaObject = await personaModel.findOne({ name: name });
        if (!personaObject && !personaCache.has(name)) {
          personaObject = personaModel.create({
            name: name,
            identity: userObject,
          });
        } else {
          console.log(
            `PREreview.org: Persona with name ${name} already exists`,
          );
        }
        let anonName = anonymus
          .create()[0]
          .replace(/(^|\s)\S/g, l => l.toUpperCase());
        while (
          (await personaModel.findOne({ name: anonName })) !== null ||
          personaCache.has(anonName)
        ) {
          console.log('PREreview.org: Anonymous name generation collision');
          anonName = anonymus.create()[0];
        }
        const anonPersonaObject = personaModel.create({
          name: anonName,
          identity: userObject,
          isAnonymous: true,
        });
        if (person.biography && person.biography['content']) {
          personaObject.bio = person.biography['content'];
        }
        console.log(
          `PREreview.org: Imported persona '${name}' for ${userObject.orcid}`,
        );
        console.log(
          `PREreview.org: Imported anonymous persona '${anonName}' for ${
            userObject.orcid
          }`,
        );
        personaCache.add(personaObject.name);
        personaCache.add(anonPersonaObject.name);
        userObject.personas.add(personaObject);
        userObject.personas.add(anonPersonaObject);
        if (person.is_private) {
          anonPersonaObject.badges.add(preBadge);
          userObject.isPrivate = true;
          userObject.defaultPersona = anonPersonaObject;
        } else {
          personaObject.badges.add(preBadge);
          userObject.isPrivate = false;
          userObject.defaultPersona = personaObject;
        }

        let emails = [];
        if (r.profile && r.profile.email && r.profile.email.address) {
          emails.push({
            value: r.profile.email.address,
            verified: !!r.profile.email.verified,
          });
        }
        if (
          Array.isArray(person.emails.email) &&
          person.emails.email.length > 0
        ) {
          for (let e of person.emails.email) {
            emails.push({
              value: e.email,
              verified: !!e.verified,
            });
          }
        }
        if (emails.length > 0) {
          emails = _.uniq(emails);
          for (let e of emails) {
            const contact = new Contact(
              'mailto',
              e.value,
              userObject,
              !!e.verified,
            );
            userObject.contacts.add(contact);
          }
          console.log(`PREreview.org: Imported email for ${r.orcid}:`, emails);
        }
        console.log(`PREreview.org: Imported user for ${r.orcid}:`, {
          orcid: r.orcid,
          createdAt: r.createdAt,
        });
      }

      // Process the deep JSON structure for a given ORCID user's published works
      if (works) {
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
            const work = new Work(title, userObject);
            if (w['work-summary'][0].url && w['work-summary'][0].url.value) {
              work.url = w['work-summary'][0].url.value;
            }
            if (
              w['work-summary'][0]['external-ids'] &&
              Array.isArray(
                w['work-summary'][0]['external-ids']['external-id'],
              ) &&
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
              let dateString =
                w['work-summary'][0]['publication-date'].year.value;
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
            userObject.works.add(work);
          }
        }
      }
      userModel.persist(userObject);
      usersMap.set(r.user_id, userObject);
    }
    console.log('PREreview.org: Flushing users to disk.');
    await userModel.flush();
    console.log('PREreview.org: Finished flushing users to disk.');
  } catch (err) {
    console.error('PREreview.org: Failed to import:', err);
  }
}

async function prereviewOrgImportReviews(db, client, usersMap, preprintsMap) {
  const fullReviewModel = fullReviewModelWrapper(db);
  try {
    const oldReviews = await client.query(
      'SELECT preprint_id,doi,date_created,content,author_id,is_hidden FROM prereviews',
    );

    for (let r of oldReviews.rows) {
      console.log(
        `PREreview.org: Fetching preprint ID ${r.preprint_id} for review`,
      );
      const preprint = preprintsMap.get(r.preprint_id);
      console.log(
        `PREreview.org: Fetching author ID ${r.author_id} for review`,
      );
      const author = usersMap.get(r.author_id);
      if (r.doi) {
        r.doi = `doi:${r.doi}`;
      }
      if (preprint && r.content) {
        const review = new FullReview(preprint, true, r.doi);
        const draft = new FullReviewDraft(review, r.content);
        review.drafts.add(draft);
        review.createdAt = new Date(r.date_created);
        review.isPublished = !r.is_hidden;
        if (author && author.defaultPersona) {
          review.authors.add(author.defaultPersona);
        } else {
          console.log(
            `PREreview.org: No default persona found for user:`,
            r.author_id,
          );
        }
        fullReviewModel.persist(review);
      }
    }
    console.log('PREreview.org: Flushing reviews to disk.');
    await fullReviewModel.flush();
    console.log('PREreview.org: Finished flushing reviews to disk.');
  } catch (err) {
    console.error('PREreview.org: Failed to import:', err);
  }
}

async function prereviewOrgImportRequests(db, client, usersMap, preprintsMap) {
  const requestModel = requestModelWrapper(db);
  try {
    const oldRequests = await client.query(
      'SELECT preprint_id,date_created,author_id FROM prereviews',
    );

    for (let r of oldRequests.rows) {
      console.log(
        `PREreview.org: Fetching preprint ID ${r.preprint_id} for request`,
      );
      const preprint = preprintsMap.get(r.preprint_id);
      console.log(
        `PREreview.org: Fetching author ID ${r.author_id} for request`,
      );
      const author = usersMap.get(r.author_id);
      if (author && author.defaultPersona && preprint) {
        const request = new Request(author.defaultPersona, preprint);
        request.createdAt = new Date(r.date_created);
        requestModel.persist(request);
      } else {
        console.log(
          `PREreview.org: No default persona found for user:`,
          r.author_id,
        );
      }
    }
    console.log('PREreview.org: Flushing requests to disk.');
    await requestModel.flush();
    console.log('PREreview.org: Finished flushing requests to disk.');
  } catch (err) {
    console.error('PREreview.org: Failed to import:', err);
  }
}

export default async function run(db) {
  const usersMap = new Map();
  const preprintsMap = new Map();
  const client = new Client({
    host: process.env.IMPORT_POSTGRES_HOST,
    port: process.env.IMPORT_POSTGRES_PORT
      ? process.env.IMPORT_POSTGRES_PORT
      : 5432,
    user: process.env.IMPORT_POSTGRES_USER,
    password: process.env.IMPORT_POSTGRES_PASS,
    database: process.env.IMPORT_POSTGRES_DB
      ? process.env.IMPORT_POSTGRES_DB
      : 'prereview',
    ssl: true,
  });
  const badgeModel = badgeModelWrapper(db);
  const tagModel = tagModelWrapper(db);

  const preBadge = badgeModel.create({ name: 'PREreview V1' });
  const preTag = tagModel.create({ name: 'Imported from PREreview V1' });
  badgeModel.persistAndFlush(preBadge);
  tagModel.persistAndFlush(preTag);
  await client.connect();
  await prereviewOrgImportPreprints(db, client, preprintsMap, preTag);
  await prereviewOrgImportUsers(db, client, usersMap, preBadge);
  await prereviewOrgImportReviews(db, client, usersMap, preprintsMap);
  await prereviewOrgImportRequests(db, client, usersMap, preprintsMap);
  await client.end();
  return;
}
