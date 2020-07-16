import { arrayify } from './jsonld';

export const SCORE_THRESHOLD = 1e-5;

/**
 * See https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d
 */
export function getScore(
  actions, // list of `RapidPREreviewAction` or `RequestForRapidPREreviewAction`
  { now = new Date().toISOString() } = {},
  {
    g = 1.8, // gravity factor
    threshold = SCORE_THRESHOLD, // if a score is below `threshold` with set it to 0
  } = {},
) {
  // sort by date posted (`startTime`)
  actions = arrayify(actions).sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  if (!actions.length) {
    return 0;
  }

  const dateTimeFirstActivity = actions[0].startTime;
  const timeSinceFirstActivityHours =
    Math.max(
      new Date(now).getTime() - new Date(dateTimeFirstActivity).getTime(),
      0,
    ) /
    (1000 * 60 * 60);

  const nReviews = actions.reduce((n, action) => {
    if (action['@type'] === 'RapidPREreviewAction') {
      n++;
    }
    return n;
  }, 0);

  const nRequests = actions.reduce((n, action) => {
    if (action['@type'] === 'RequestForRapidPREreviewAction') {
      n++;
    }
    return n;
  }, 0);

  const score =
    (nReviews + nRequests) / Math.pow(timeSinceFirstActivityHours + 1, g);

  return score <= threshold ? 0 : score;
}

/**
 * Used to display the filling of the hourglass visualization in the score badge
 * Returned value must be between 0 and 1
 */
export function getTimeScore(
  dateTimeFirstActivity,
  now = new Date().toISOString(),
) {
  const timeSinceFirstActivityHours =
    Math.max(
      new Date(now).getTime() - new Date(dateTimeFirstActivity).getTime(),
      0,
    ) /
    (1000 * 60 * 60);

  const timeScore = 1 / Math.pow(timeSinceFirstActivityHours + 1, 0.5);

  return timeScore;
}
