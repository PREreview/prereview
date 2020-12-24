//const fetch = require('node-fetch');
//const fs = require('fs');
//const { create } = require('xmlbuilder2');
//const Feed = require('feed').Feed;
import fs from 'fs';
//import path from 'path';
import fetch from 'node-fetch';
import ndjson from 'ndjson';
import _ from 'lodash';
import { dbWrapper } from '../db.ts';
import {
  fullReviewModelWrapper,
  fullReviewDraftModelWrapper,
  personaModelWrapper,
  preprintModelWrapper,
  userModelWrapper,
} from '../models/index.ts';
import { Client } from 'pg';
import anonymus from 'anonymus';
import { resolvePreprint } from '../utils/resolve2.ts';
import { getOrcidPerson, getOrcidWorks } from '../utils/orcid.js';
import getMetadata from '../utils/getMetadata.js';
import {
  Contact,
  FullReview,
  FullReviewDraft,
  Persona,
  Preprint,
  RapidRequest,
  Request,
  User,
  Work,
} from '../models/entities/index.ts';

//import fs from 'fs';

//const REVIEWS_API_URL =
//  'https://outbreaksci.prereview.org/api/action?q=@type:RapidPREreviewAction&include_docs=true';

const USERS_API_URL =
  'https://outbreaksci.prereview.org/api/role?q=*:*&include_docs=true';

// only fetches preprints with reviews
const PREPRINTS_API_URL = 'https://outbreaksci.prereview.org/api/preprint?';
const REVIEWED_PREPRINTS_QUERY =
  'q=nReviews:[1+TO+Infinity]&sort=["-score<number>","-datePosted<number>","-dateLastActivity<number>"]&include_docs=true&counts=["hasPeerRec","hasOthersRec","hasData","hasCode","hasReviews","hasRequests","subjectName"]&ranges={"nReviews":{"0":"[0+TO+1}","1+":"[1+TO+Infinity]","2+":"[2+TO+Infinity]","3+":"[3+TO+Infinity]","4+":"[4+TO+Infinity]","5+":"[5+TO+Infinity]"},"nRequests":{"0":"[0+TO+1}","1+":"[1+TO+Infinity]","2+":"[2+TO+Infinity]","3+":"[3+TO+Infinity]","4+":"[4+TO+Infinity]","5+":"[5+TO+Infinity]"}}';

//const getReviews = async bookmark => {
//  let url = REVIEWS_API_URL;
//
//  if (bookmark) {
//    url = url + `&bookmark=${bookmark}`;
//  }
//
//  try {
//    const response = await fetch(url);
//    const data = await response.json();
//    return data;
//  } catch (error) {
//    console.log('oh dear, looks like we broke the reviews fetch: ', error);
//  }
//};

const processJsonDump = (path, cb) => {
  fs.createReadStream(path)
    .pipe(ndjson.parse())
    .on('data', obj => cb(obj));
};

const processJson = path => {
  const users = new Map();
  const roles = new Map();
  const contacts = new Map();
  const processJsonArray = obj => {
    obj.map(item => {
      if (item['@type'] === 'Person') {
        console.log('inserting person');
        users.set(item['@id'], item);
      } else if (item['@type'] === 'PublicReviewerRole') {
        console.log('inserting role');
        roles.set(item['@id'], item);
      } else if (item['@type'] === 'ContactPoint') {
        console.log('inserting contact');
        contacts.set(item['@id'], item);
      }
    });
  };
  processJsonDump(path, processJsonArray);
};

const getUsers = async bookmark => {
  let url = USERS_API_URL;

  if (bookmark) {
    url = url + `&bookmark=${bookmark}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('oh dear, looks like we broke the users fetch: ', error);
  }
};

const getPreprints = async bookmark => {
  let url = PREPRINTS_API_URL + REVIEWED_PREPRINTS_QUERY;

  if (bookmark) {
    url =
      PREPRINTS_API_URL +
      `bookmark=${bookmark}` +
      `&${REVIEWED_PREPRINTS_QUERY}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('oh dear, looks like we broke the users fetch: ', error);
  }
};

//const getAllReviews = async () => {
//  let prevBookmark = null;
//  let results = [];
//  let prevRows = [];
//
//  do {
//    let { rows, bookmark } = await getReviews(prevBookmark);
//    prevBookmark = bookmark;
//    prevRows = rows;
//    results = results.concat(rows);
//  } while (prevRows.length > 0);
//
//  return results;
//};

const getAllRoles = async () => {
  let prevBookmark = null;
  let results = [];
  let prevRows = [];

  do {
    let { rows, bookmark } = await getUsers(prevBookmark);
    prevBookmark = bookmark;
    prevRows = rows;
    results = results.concat(rows);
  } while (prevRows.length > 0);

  return results;
};

const getAllPreprints = async () => {
  let prevBookmark = null;
  let results = [];
  let prevRows = [];

  do {
    let { rows, bookmark } = await getPreprints(prevBookmark);
    prevBookmark = bookmark;
    prevRows = rows;
    results = results.concat(rows);
  } while (prevRows.length > 0);

  return results;
};

const OSrPREImportAll = async () => {
  const roles = await getAllRoles();
  const rolesMap = roles.reduce((rolesMap, role) => {
    rolesMap.set(role.id, {
      isAnonymous: role.doc['@type'] === 'AnonymousReviewerRole',
      name:
        role.doc['@type'] === 'AnonymousReviewerRole'
          ? 'Anonymous'
          : role.doc.name,
    });
    return rolesMap;
  }, new Map());

  //const allReviews = await getAllReviews();

  //const sorted = cleaned.sort((a, b) => b.dateReviewed - a.dateReviewed);

  //const reviews = JSON.stringify(sorted, null, 2);

  const preprints = await getAllPreprints();

  const processAnswers = answers => {
    const rapid = {};
    let full;
    answers.map(answer => {
      const key = answer.parentItem.split(':')[1];
      if (key.startsWith('yn')) {
        if (answer.text === 'n.a.') {
          answer.text = 'N/A';
        }
        rapid[`${key}`] = answer.text;
      } else if (key.startsWith('c') && answer.text) {
        if (!full) {
          full = 'Imported from Outbreak Science:\n';
        }
        full.concat(`${key}:\n ${answer.text}`);
      }
    });
    return { rapid, full };
  };

  const processActions = actions => {
    let rapid = [],
      full = [],
      requests = [];

    actions.map(action => {
      if (action['@type'] === 'RequestForRapidPREreviewAction') {
        requests.push({
          author: rolesMap.get(action.agent),
          createdAt: action.startTime,
          updatedAt: new Date(),
        });
      } else if (action['@type'] === 'RapidPREreviewAction') {
        const reviewHeader = {
          author: rolesMap.get(action.agent),
          createdAt: action.startTime,
          updatedAt: new Date(),
        };
        const { rapid: rapidAnswers, full: fullAnswers } = processAnswers(
          action.resultReview.reviewAnswer,
        );
        if (rapidAnswers) {
          rapid.push({ ...reviewHeader, ...rapidAnswers });
        }

        if (fullAnswers) {
          full.push({ ...reviewHeader, content: fullAnswers });
        }
      }
    });
    return { rapid, full, requests };
  };

  const cleaned = preprints.map(preprint => {
    const { rapid, full, requests } = processActions(
      preprint.doc.potentialAction,
    );

    return {
      handle: preprint.doc.doi
        ? `doi:${preprint.doc.doi}`
        : `arXivId:${preprint.doc.arXivId}`,
      title: preprint.doc.name,
      preprintServer: preprint.doc.preprintServer
        ? preprint.doc.preprintServer.name.toLowerCase()
        : undefined,
      datePosted: new Date(preprint.doc.datePosted),
      contentUrl: preprint.doc.encoding
        ? preprint.doc.encoding.contentUrl
        : undefined,
      contentEncoding: preprint.doc.encoding
        ? preprint.doc.encoding.encodingFormat
        : undefined,
      createdAt: preprint.doc.sdDateRetrieved,
      updatedAt: new Date(),
      rapidReviews: rapid,
      fullReviews: full,
      requests: requests,
    };
  });

  console.log('cleaned:', JSON.stringify(cleaned, null, 2));

  //fs.writeFile('reviews.json', reviews, (error) => {
  //  if (error) throw error;
  //  console.log('A JSON file of all reviews has been saved to reviews.json!');
  //});

  //return sorted;
};

//const processPreprints = async () => {
//  const hasReviews = await getAllPreprints();
//  const withDOI = hasReviews.filter(preprint => !!preprint.doc.doi);
//
//  const processed = withDOI.map(preprint => {
//    return {
//      title: preprint.doc.name,
//      doi: preprint.doc.doi,
//      link: `https://outbreaksci.prereview.org/${preprint.doc.doi}`,
//    };
//  });
//
//  return processed;
//}

async function prereviewOrgImportPreprints(db, client, preprintsMap) {
  const preprintModel = preprintModelWrapper(db);
  try {
    const oldPreprints = await client.query(
      'SELECT id AS handle,title,date_created AS "createdAt",source AS url,publisher AS "preprintServer",date_published AS "datePosted" FROM preprints',
    );

    for (let r of oldPreprints.rows) {
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
      } else {
        console.log('ERROR');
      }
      let preprint = await preprintModel.findOne({ handle: handle });
      if (
        !preprint &&
        handle !== 'doi:10.1101/2020.06.07.138883' &&
        handle !== 'arxiv:2001.00010'
      ) {
        preprint = new Preprint(
          handle,
          lookup.title,
          true,
          lookup.abstractText,
          lookup.preprintServer,
          lookup.datePosted,
          lookup.license,
          lookup.publication,
          lookup.url,
          lookup.contentEncoding,
          lookup.contentUrl,
        );
        await preprintModel.persistAndFlush(preprint);
        console.log(`PREreview.org: Inserted Preprint ${preprint.handle}`);
      } else {
        console.log(`PREreview.org: Duplicate preprint ${handle}, skipping`);
      }
      preprintsMap.set(r.handle, preprint);
    }
    console.log('PREreview.org: Flushing preprints to disk.');
    //await preprintModel.flush();
    console.log('PREreview.org: Done flushing preprints to disk.');
  } catch (err) {
    console.error('Failed to import:', err);
  }
}

async function prereviewOrgImportUsers(db, client, usersMap) {
  const userModel = userModelWrapper(db);
  const personaModel = personaModelWrapper(db);
  try {
    const oldUsers = await client.query(
      'SELECT user_id,orcid,name,created_at AS "createdAt",profile FROM users',
    );
    console.log('PREreview.org: Queried user database');

    const allUsers = [];
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
        userObject = new User(r.orcid);
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
        if (!personaObject) {
          personaObject = new Persona(name, userObject);
        } else {
          console.log(
            `PREreview.org: Persona with name ${name} already exists`,
          );
        }
        let anonName = anonymus.create()[0];
        while ((await personaModel.findOne({ name: anonName })) !== null) {
          console.log('PREreview.org: Anonymous name generation collision');
          anonName = anonymus.create()[0];
        }
        const anonPersonaObject = new Persona(anonName, userObject, true);
        if (person.biography && person.biography['content']) {
          personaObject.bio = person.biography['content'];
        }
        userObject.personas.add(personaObject);
        userObject.personas.add(anonPersonaObject);
        if (person.is_private) {
          userObject.isPrivate = true;
          userObject.defaultPersona = anonPersonaObject;
        } else {
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
      await userModel.persistAndFlush(userObject);
      usersMap.set(r.user_id, userObject);
    }
    //await userModel.flush();
  } catch (err) {
    console.error('PREreview.org: Failed to import:', err);
  }
}

async function prereviewOrgImportReviews(db, client, usersMap, preprintsMap) {
  const fullReviewModel = fullReviewModelWrapper(db);
  const fullReviewDraftModel = fullReviewDraftModelWrapper(db);
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
      const review = new FullReview(preprint, true, r.doi);
      const draft = new FullReviewDraft(review, r.content);
      review.drafts.add(draft);
      review.createdAt = new Date(r.date_created);
      review.published = !r.is_hidden;
      if (author && author.defaultPersona) {
        review.authors.add(author.defaultPersona);
      } else {
        console.log(
          `PREreview.org: No default persona found for user:`,
          author,
        );
      }
      console.log('***REVIEW***:', review);
      await fullReviewModel.persistAndFlush(review);
      //fullReviewDraftModel.persist(draft);
    }
    //fullReviewModel.flush();
  } catch (err) {
    console.error('PREreview.org: Failed to import:', err);
  }
}

async function main() {
  //process('/home/n0n/net/rapid-prereview-docs.txt');
  const usersMap = new Map();
  const preprintsMap = new Map();
  const [db] = await dbWrapper();
  const client = new Client({
    host: process.env.IMPORT_HOST,
    port: process.env.IMPORT_PORT ? process.env.IMPORT_PORT : 5432,
    user: process.env.IMPORT_USER,
    password: process.env.IMPORT_PASS,
    database: process.env.IMPORT_DB ? process.env.IMPORT_DB : 'prereview',
    ssl: true,
  });

  await client.connect();
  await prereviewOrgImportPreprints(db, client, preprintsMap);
  await prereviewOrgImportUsers(db, client, usersMap);
  await prereviewOrgImportReviews(db, client, usersMap, preprintsMap);
  //savePreprints();
  await client.end();
}

main();
