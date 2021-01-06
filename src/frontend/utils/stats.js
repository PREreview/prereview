import { QUESTIONS } from '../constants';
import { arrayify } from './jsonld';
import { checkIfIsModerated } from './actions';

function isYes(textOrAnswer) {
  const text =
    typeof textOrAnswer === 'string'
      ? textOrAnswer
      : textOrAnswer
      ? textOrAnswer.text
      : '';

  return (text || '').toLowerCase().trim() === 'yes';
}

function isNo(textOrAnswer) {
  const text =
    typeof textOrAnswer === 'string'
      ? textOrAnswer
      : textOrAnswer
      ? textOrAnswer.text
      : '';

  return (text || '').toLowerCase().trim() === 'no';
}

function isNa(textOrAnswer) {
  const text =
    typeof textOrAnswer === 'string'
      ? textOrAnswer
      : textOrAnswer
      ? textOrAnswer.text
      : '';

  return (text || '').toLowerCase().trim() === 'n/a';
}

function isUnsure(textOrAnswer) {
  const text =
    typeof textOrAnswer === 'string'
      ? textOrAnswer
      : textOrAnswer
      ? textOrAnswer.text
      : '';

  return (text || '').toLowerCase().trim() === 'unsure';
}

/**
 * Tags are computed following a majority rule
 */
export function getTags(preprint) {
  const hasReviews = preprint.rapidReviews.length || preprint.fullReviews.length;

  const hasRequests = preprint.requests.length;

  const threshold = preprint.rapidReviews.length
    ? Math.ceil(preprint.rapidReviews.length / 2)
    : 0;

  // hasData
  const reviewsWithData = preprint.rapidReviews.filter(review => {
    if (review.ynAvailableData) {
      return isYes(review.ynAvailableData);
    }
    return false;
  });

  const hasData =
    reviewsWithData &&
    reviewsWithData.length &&
    reviewsWithData.length >= threshold;

  // hasCode
  const reviewsWithCode = preprint.rapidReviews.filter(review => {
    if (review.ynAvailableCode) {
      return isYes(review.ynAvailableCode);
    }
    return false;
  });

  const hasCode =
    reviewsWithCode &&
    reviewsWithCode.length &&
    reviewsWithCode.length >= threshold;

  // subjects
  let subjects = [];

  if (preprint.tags.length) {
    subjects = preprint.tags;
  }

  return { hasReviews, hasRequests, hasData, hasCode, subjects };
}

export function getYesNoStats(reviews = []) {
  return QUESTIONS.filter(({ type }) => type === 'YesNoQuestion').map(
    ({ identifier, question }) => {
      return {
        questionId: `question:${identifier}`,
        nReviews: reviews.length,
        question,
        yes: reviews.filter(review => {
          return isYes(review[identifier]);
        }),
        no: reviews.filter(review => {
          return isNo(review[identifier]);
        }),
        na: reviews.filter(review => {
          return isNa(review[identifier]);
        }),
        unsure: reviews.filter(review => {
          return isUnsure(review[identifier]);
        }),
      };
    },
  );
}

export function getTextAnswers(reviews = []) {
  return QUESTIONS.filter(({ type }) => {
    return type === 'Question';
  }).map(({ question, identifier }) => {
    return {
      questionId: `question:${identifier}`,
      question,
      answers: reviews.map(review => {
        return {
          author: review.author,
          text: review[identifier],
        };
      })
    };
  });
}

export function getActiveReports(
  action, // a `RapidPREreviewAction`
) {
  // moderation action are sorted so we get all the report untill the previous
  // `ModerateRapidPREreviewAction` or `IgnoreRapidPREreviewAction` action
  const moderationActions = arrayify(action.moderationAction);

  const reports = [];
  for (let i = moderationActions.length - 1; i >= 0; i--) {
    const moderationAction = moderationActions[i];
    if (moderationAction['@type'] === 'ReportRapidPREreviewAction') {
      reports.push(moderationAction);
    } else {
      break;
    }
  }

  return reports;
}

export function getCounts(actions) {
  const safeActions = arrayify(actions).filter(
    action => !checkIfIsModerated(action),
  );

  const nRequests = safeActions.reduce((count, action) => {
    if (action['@type'] === 'RequestForRapidPREreviewAction') {
      count++;
    }
    return count;
  }, 0);

  const nReviews = safeActions.reduce((count, action) => {
    if (action['@type'] === 'RapidPREreviewAction') {
      count++;
    }
    return count;
  }, 0);

  return { nRequests, nReviews };
}
