//const fetch = require('node-fetch');
//const fs = require('fs');
//const { create } = require('xmlbuilder2');
//const Feed = require('feed').Feed;
import fetch from 'node-fetch';
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

const main = async () => {
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
//};

main();
