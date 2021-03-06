import fs from 'fs';
import _ from 'lodash';
import ndjson from 'ndjson';
import {
  badgeModelWrapper,
  communityModelWrapper,
  fullReviewModelWrapper,
  personaModelWrapper,
  preprintModelWrapper,
  rapidReviewModelWrapper,
  requestModelWrapper,
  tagModelWrapper,
  userModelWrapper,
} from '../../models/index.ts';
import anonymus from 'anonymus';
import { resolvePreprint } from '../../utils/resolve.ts';
import { getOrcidPerson, getOrcidWorks } from '../../utils/orcid.js';
import {
  Contact,
  FullReview,
  FullReviewDraft,
  //Preprint,
  RapidReview,
  Request,
  Work,
} from '../../models/entities/index.ts';
import PQueue from 'p-queue';

const BATCH_SIZE = 9999;
const queue = new PQueue({ concurrency: 1 });

const processJsonDump = (path, cb) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path)
      .pipe(ndjson.parse())
      .on('end', resolve)
      .on('error', reject)
      .on('data', obj => cb(obj));
  });
};

const processUsers = (path, userHandler, em) => {
  const processJsonArray = obj => {
    let count = 0;
    obj.map(async item => {
      if (item['@type'] === 'Person') {
        console.log(`inserting person ${item['@id']}`);
        queue.add(async () => await userHandler(item));
        count = count + 1;
      }
      if (count >= BATCH_SIZE) {
        queue.add(async () => {
          console.log(`OSrPRE: Flushing batch of ${BATCH_SIZE} users to disk`);
          await em.flush();
          console.log(
            `OSrPRE: Done flushing batch of ${BATCH_SIZE} users to disk`,
          );
        });
        count = 0;
      }
    });
  };
  return processJsonDump(path, processJsonArray);
};

const processPersonas = (path, anonMap) => {
  const processJsonArray = obj => {
    obj.map(item => {
      if (item['@type'] === 'AnonymousReviewerRole') {
        console.log(`inserting role ${item['@id']}`);
        anonMap.set(item['@id'], true);
      } else if (item['@type'] === 'PublicReviewerRole') {
        console.log(`inserting role ${item['@id']}`);
        anonMap.set(item['@id'], false);
      }
    });
  };
  return processJsonDump(path, processJsonArray);
};

const processActions = (path, requestHandler, reviewHandler, em) => {
  const processJsonArray = obj => {
    let count = 0;
    obj.map(async item => {
      if (item['@type'] === 'RequestForRapidPREreviewAction') {
        console.log(`inserting request ${item['@id']}`);
        queue.add(async () => await requestHandler(item));
        count = count + 1;
      } else if (item['@type'] === 'RapidPREreviewAction') {
        console.log(`inserting review ${item['@id']}`);
        queue.add(async () => await reviewHandler(item));
        count = count + 1;
      }
      if (count >= BATCH_SIZE) {
        queue.add(async () => {
          console.log(
            `OSrPRE: Flushing batch of ${BATCH_SIZE} reviews/requests to disk`,
          );
          await em.flush();
          console.log(
            `OSrPRE: Done flushing batch of ${BATCH_SIZE} reviews/requests to disk`,
          );
        });
        count = 0;
      }
    });
  };
  return processJsonDump(path, processJsonArray);
};

async function OSrPREImportReview(
  fullReviewModel,
  preprintModel,
  preprintCache,
  rapidReviewModel,
  personaModel,
  personasMap,
  osrpreCommunity,
  osrpreTag,
) {
  return async record => {
    try {
      console.log(`OSrPRE: Fetching reviewer ${record.agent}`);
      let persona;
      persona = personasMap.get(record.agent);
      if (!persona && record.object && record.object.name) {
        persona = await personaModel.findOne({ name: record.object.name });
      }
      if (!persona) {
        throw new Error('No persona');
      }
      console.log('OSrPRE: Fetching reviewed preprint', record.object);
      const preprint = await OSrPREImportPreprint(
        record.object,
        preprintModel,
        preprintCache,
        osrpreCommunity,
        osrpreTag,
      );
      if (!preprint) {
        throw new Error('No preprint');
      }
      let full;
      const rapid = new RapidReview(persona, preprint);
      record.resultReview.reviewAnswer.map(answer => {
        const key = answer.parentItem['@id'].split(':')[1];
        if (key.startsWith('yn')) {
          if (answer.text === 'n.a.') {
            answer.text = 'N/A';
          }
          rapid[`${key}`] = answer.text;
        } else if (key.startsWith('c') && answer.text) {
          if (!full) {
            full = 'Imported from Outbreak Science:\n';
          }
          full = full.concat(`${key}:\n ${answer.text}`);
        }
      });
      rapidReviewModel.persist(rapid);
      if (full) {
        const review = new FullReview(preprint, true);
        const draft = new FullReviewDraft(review, full);
        review.drafts.add(draft);
        review.createdAt = new Date(record.startTime);
        review.authors.add(persona);
        fullReviewModel.persist(review);
      }
      return;
    } catch (err) {
      console.error('Failed to import review:', err);
    }
  };
}

async function OSrPREImportRequest(
  requestModel,
  preprintModel,
  preprintCache,
  personaModel,
  personasMap,
  osrpreCommunity,
  osrpreTag,
) {
  return async record => {
    try {
      console.log(`OSrPRE: Fetching requester ${record.agent}`);
      let persona;
      persona = personasMap.get(record.agent);
      if (!persona && record.object && record.object.name) {
        persona = await personaModel.findOne({ name: record.object.name });
      }
      if (!persona) {
        throw new Error('No persona');
      }
      console.log('OSrPRE: Fetching requested preprint', record.object);
      const preprint = await OSrPREImportPreprint(
        record.object,
        preprintModel,
        preprintCache,
        osrpreCommunity,
        osrpreTag,
      );
      if (!preprint) {
        throw new Error('No preprint');
      }
      const request = new Request(persona, preprint);
      requestModel.persist(request);
    } catch (err) {
      console.error('Failed to import request:', err);
    }
  };
}

async function OSrPREImportPreprint(
  record,
  preprintModel,
  preprintCache,
  osrpreCommunity,
  osrpreTag,
) {
  try {
    record.createdAt = new Date(record.createdAt);
    record.datePosted = new Date(record.datePosted);
    let handle, lookup;
    if (record.doi) {
      lookup = await resolvePreprint(record.doi);
      handle = `doi:${record.doi}`;
    } else if (record.arXivId) {
      lookup = await resolvePreprint(record.arXivId);
      handle = `arxiv:${record.arXivId}`;
    } else {
      console.log('ERROR');
    }
    let preprint;
    preprint = await preprintModel.findOne({ handle: handle });
    if (!preprint) {
      preprint = preprintCache.get(handle);
    }
    if (!preprint) {
      let source;
      if (lookup) {
        source = lookup;
      } else {
        console.warn(`OSrPRE: Failed to lookup preprint, using data as-is`);
        source = record;
      }
      if (!source.title) {
        console.error('OSrPRE: Blank title, skipping');
        return;
      }
      preprint = preprintModel.create({
        handle: handle,
        title: source.title,
        isPublished: true,
        datePosted: source.datePosted,
        abstractText: source.abstractText,
        preprintServer: source.preprintServer,
        license: source.license,
        publication: source.publication,
        url: source.url,
        contentEncoding: source.contentEncoding,
        contentUrl: source.contentUrl,
      });
      preprint.communities.add(osrpreCommunity);
      preprint.tags.add(osrpreTag);
      preprintModel.persist(preprint);
      preprintCache.set(handle, preprint);
      console.log(`OSrPRE: Inserted Preprint ${preprint.handle}`);
    } else {
      console.log(`OSrPRE: Duplicate preprint ${handle}, skipping`);
    }
    //console.log('OSrPRE: Flushing preprints to disk.');
    //await preprintModel.flush();
    //console.log('OSrPRE: Done flushing preprints to disk.');
    return preprint;
  } catch (err) {
    console.error('Failed to import:', err);
  }
}

async function OSrPREImportUser(
  userModel,
  personaModel,
  usersMap,
  personasMap,
  isAnon,
  osrpreCommunity,
  osrpreBadge,
  userCache,
  personaCache,
) {
  return async record => {
    if (
      (await userModel.findOne({ orcid: record.orcid })) !== null ||
      userCache.has(record.orcid)
    ) {
      console.log(`OSrPRE: Duplicate user ${record.orcid}, skipping`);
      return;
    }
    try {
      record.createdAt = new Date(record.dateCreated);
      let person, works;
      try {
        person = await getOrcidPerson(record.orcid);
      } catch (err) {
        console.log('OSrPRE: Failed to fetch ORCID person:', err);
      }
      try {
        works = await getOrcidWorks(record.orcid);
      } catch (err) {
        console.log('OSrPRE: Failed to fetch ORCID works:', err);
      }

      // Process the deep JSON structure for a given ORCID user
      let userObject, personaObject, anonPersonaObject;
      if (person) {
        userObject = userModel.create({ orcid: record.orcid });
        //userObject.createdAt = new Date(record.createdAt);
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
          name = record.name;
        }

        if (record.hasRole && Array.isArray(record.hasRole)) {
          await Promise.all(
            record.hasRole.map(async id => {
              if (isAnon.get(id) === false) {
                if (name === '' || name === null || name === undefined) {
                  console.log(
                    `OSrPRE: Can't import existing persona with blank name, skipping.`,
                  );
                  return;
                }
                const hasCache = personaCache.has(name);
                if (hasCache) {
                  console.log(
                    `OSrPRE: Duplicate persona name ${name}, skipping.`,
                  );
                  return;
                }
                personaObject = await personaModel.findOne({ name: name });
                if (!personaObject) {
                  personaObject = personaModel.create({
                    name: name,
                    isAnonymous: false,
                  });
                }
                if (person.biography && person.biography['content']) {
                  personaObject.bio = person.biography['content'];
                }
                if (!person.is_private) {
                  personaObject.communities.add(osrpreCommunity);
                  personaObject.badges.add(osrpreBadge);
                  userObject.isPrivate = false;
                  userObject.defaultPersona = personaObject;
                }
                if (!userObject.personas.contains(personaObject)) {
                  userObject.personas.add(personaObject);
                }
                console.log(
                  `OSrPRE: Imported persona '${name}' for ${record.orcid}`,
                );
                personaModel.persist(personaObject);
                personaCache.add(name);
                personasMap.set(id, personaObject);
              } else if (isAnon.get(id) === true) {
                if (name === '' || name === null || name === undefined) {
                  console.log(
                    `OSrPRE: Can't import existing persona with blank name, skipping.`,
                  );
                  return;
                }
                const ANON_TRIES_LIMIT = 5;
                let anonName = anonymus
                  .create()[0]
                  .replace(/(^|\s)\S/g, l => l.toUpperCase());
                let tries = 0;
                while (
                  (await personaModel.findOne({ name: anonName })) !== null ||
                  personaCache.has(anonName)
                ) {
                  console.log('OSrPRE: Anonymous name generation collision');
                  anonName = anonymus
                    .create()[0]
                    .replace(/(^|\s)\S/g, l => l.toUpperCase());
                  tries = tries + 1;
                  if (tries >= ANON_TRIES_LIMIT) {
                    anonName = anonName + ` ${tries - ANON_TRIES_LIMIT}`;
                  }
                }
                anonPersonaObject = personaModel.create({
                  name: anonName,
                  isAnonymous: true,
                });
                if (person.is_private) {
                  anonPersonaObject.communities.add(osrpreCommunity);
                  anonPersonaObject.badges.add(osrpreBadge);
                  userObject.isPrivate = true;
                  userObject.defaultPersona = anonPersonaObject;
                }
                userObject.personas.add(anonPersonaObject);
                //console.log(
                //  `***inserting anon into personasMap ${id}:`,
                //  anonPersonaObject,
                //);
                console.log(
                  `OSrPRE: Imported anonymous persona '${anonName}' for ${
                    record.orcid
                  }`,
                );
                personaModel.persist(anonPersonaObject);
                personaCache.add(anonName);
                personasMap.set(id, anonPersonaObject);
              } else {
                console.warn(`No such role ${id} mapped`);
              }
            }),
          );
        }

        let emails = [];
        if (
          record.contactPoint &&
          record.contactPoint.email &&
          record.contactPoint['@type'] === 'ContactPoint'
        ) {
          let address = record.contactPoint.email.replace(/^mailto:/, '');
          emails.push({
            value: address,
            verified: true,
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
          emails = _.uniqBy(emails, 'value');
          for (let e of emails) {
            const contact = new Contact(
              'mailto',
              e.value,
              userObject,
              !!e.verified,
            );
            userObject.contacts.add(contact);
          }
          console.log(`OSrPRE: Imported email for ${record.orcid}:`, emails);
        }
      }

      // Process the deep JSON structure for a given ORCID user's published works
      if (works && person) {
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
      console.log(`OSrPRE: Imported user for ${record.orcid}:`, {
        orcid: record.orcid,
        createdAt: record.dateCreated,
      });

      //personaModel.persist([anonPersonaObject, personaObject]);
      //console.log('userCache:', userCache);
      //console.log('personaCache:', personaCache);
      userModel.persist(userObject);
      userCache.add(record.orcid);
      usersMap.set(record['@id'], userObject);
      return;
    } catch (err) {
      console.error('OSrPRE: Failed to import:', err);
    }
  };
}

export default async function run(db) {
  const userMap = new Map();
  const personaMap = new Map();
  const anonMap = new Map();
  const badgeModel = badgeModelWrapper(db);
  const communityModel = communityModelWrapper(db);
  const fullReviewModel = fullReviewModelWrapper(db);
  const personaModel = personaModelWrapper(db);
  const preprintModel = preprintModelWrapper(db);
  const rapidReviewModel = rapidReviewModelWrapper(db);
  const requestModel = requestModelWrapper(db);
  const tagModel = tagModelWrapper(db);
  const userModel = userModelWrapper(db);

  const osrpreCommunity = communityModel.create({
    name: 'Outbreak Science',
    slug: 'outbreaksci',
    description: 'A community for reviews of outbreak-related preprints.',
  });
  const osrpreBadge = badgeModel.create({ name: 'Outbreak Science' });
  const osrpreTag = tagModel.create({ name: 'Imported from OSrPRE' });
  communityModel.persistAndFlush(osrpreCommunity);
  badgeModel.persistAndFlush(osrpreBadge);
  tagModel.persistAndFlush(osrpreTag);

  const userCache = new Set();
  const personaCache = new Set();
  const preprintCache = new Map();
  await processPersonas(
    `${process.env.IMPORT_COUCH_OUTDIR}/rapid-prereview-docs.jsonl`,
    anonMap,
  );
  queue.add(async () => {
    console.log('OSrPRE: Flushing personas to disk.');
    await communityModel.em.flush();
    console.log('OSrPRE: Finished flushing personas to disk.');
    return;
  });
  await processUsers(
    `${process.env.IMPORT_COUCH_OUTDIR}/rapid-prereview-users.jsonl`,
    await OSrPREImportUser(
      userModel,
      personaModel,
      userMap,
      personaMap,
      anonMap,
      osrpreCommunity,
      osrpreBadge,
      userCache,
      personaCache,
    ),
    communityModel.em,
  );
  queue.add(async () => {
    console.log('OSrPRE: Flushing users to disk.');
    await communityModel.em.flush();
    console.log('OSrPRE: Finished flushing users to disk.');
    return;
  });
  await processActions(
    `${process.env.IMPORT_COUCH_OUTDIR}/rapid-prereview-docs.jsonl`,
    await OSrPREImportRequest(
      requestModel,
      preprintModel,
      preprintCache,
      personaModel,
      personaMap,
      osrpreCommunity,
      osrpreTag,
    ),
    await OSrPREImportReview(
      fullReviewModel,
      preprintModel,
      preprintCache,
      rapidReviewModel,
      personaModel,
      personaMap,
      osrpreCommunity,
      osrpreTag,
    ),
  );
  queue.add(async () => {
    console.log('OSrPRE: Flushing requests & reviews to disk.');
    await communityModel.em.flush();
    console.log('OSrPRE: Finished flushing requests & reviews to disk.');
    return;
  });
  await queue.onIdle();
  return;
}
