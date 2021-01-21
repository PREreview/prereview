import { useState, useEffect, useCallback } from 'react';

/**
 * Note actions should always have a length of at least 1 as only preprint
 * with reviews or requests for reviews are listed
 */
export function useAnimatedScore(preprint, now = new Date().toISOString()) {
  // return {
  //   nRequests: preprint.requests.length,
  //   nReviews: preprint.fullReviews.length + preprint.rapidReviews.length,
  //   now: now,
  //   dateFirstActivity: now,
  //   dateLastActivity: now,
  //   lastActionType: 'RapidPrereviewAction',
  //   dateLastReview: now,
  //   dateLastRequest: now,
  //   onStartAnim: () => {},
  //   onStopAnim: () => {},
  //   isAnimating: false,
  // };

  const publishedReviews = preprint.fullReviews.filter(
    review => review.isPublished,
  );

  const sorted = publishedReviews
    .concat(preprint.rapidReviews)
    .concat(preprint.requests)
    .sort((a, b) => {
      return new Date(a.updatedAt) - new Date(b.updatedAt);
    });

  const [index, setIndex] = useState(null);

  const [isAnimating, setIsAnimating] = useState(false);

  let nRequests = 0;
  let nRapidReviews = 0;
  let nLongReviews = 0;
  let handleStopAnim, handleStartAnim;
  let playedTime = new Date();

  if (sorted.length) {
    const tmin = new Date(sorted[0].updatedAt);
    const tmax = Math.max(
      new Date(now),
      new Date(sorted[sorted.length - 1].updatedAt),
    );

    // if all the actions are at the beginning and all happened a while ago, the animation is
    // going to be uggly with all the numbers changing without the circle growing
    // => In those case we just pretent that all the actions were posted regularly
    // and one after another
    const prettify =
      new Date(now) - new Date(sorted[sorted.length - 1].updatedAt) >
      2 *
        (new Date(sorted[sorted.length - 1].updatedAt) -
          new Date(sorted[0].updatedAt));

    useEffect(() => {
      if (index !== null && index < sorted.length) {
        const totalAnimTime = Math.max(
          Math.min(sorted.length * 100, 1000),
          1000,
        );

        let timeout;
        if (prettify) {
          timeout = totalAnimTime / sorted.length;
        } else if (sorted.length > 1) {
          const t = new Date(sorted[Math.max(index - 1, 0)].updatedAt);
          const nextT = new Date(
            index >= sorted.length - 1
              ? now
              : sorted[Math.max(index, 0)].updatedAt,
          );

          const rT = ((t - tmin) / (tmax - tmin)) * totalAnimTime;
          const rNextT = ((nextT - tmin) / (tmax - tmin)) * totalAnimTime;
          timeout = rNextT - rT;
        } else {
          timeout = totalAnimTime;
        }

        const timeoutId = setTimeout(() => {
          setIndex(index + 1);
        }, timeout);

        return () => {
          clearTimeout(timeoutId);
        };
      } else {
        setIsAnimating(false);
      }
    }, [index, sorted, tmin, tmax, now, prettify]);

    handleStartAnim = useCallback(
      function handleStartAnim() {
        if (sorted.length > 1) {
          setIndex(-1);
          setIsAnimating(true);
        }
      },
      [sorted],
    );
    handleStopAnim = useCallback(function handleStopAnim() {
      setIndex(null);
      setIsAnimating(false);
    }, []);

    nRequests = preprint.requests.length;
    nRapidReviews = preprint.rapidReviews.length;
    nLongReviews = publishedReviews.length;

    if (index === null || index >= sorted.length) {
      playedTime = now;
    } else if (index === -1) {
      playedTime = sorted[0] && sorted[0].updatedAt;
    } else if (prettify) {
      playedTime = new Date(
        (index / (sorted.length - 1)) * (tmax - tmin) + tmin,
      ).toISOString();
    } else {
      playedTime = sorted[index].updatedAt;
    }
  }

  return {
    nRequests,
    nRapidReviews,
    nLongReviews,
    now: playedTime,
    onStartAnim: handleStartAnim,
    onStopAnim: handleStopAnim,
    dateFirstActivity: sorted[0] && sorted[0].updatedAt,
    dateLastActivity:
      sorted[sorted.length - 1] && sorted[sorted.length - 1].updatedAt,
    lastActionType:
      sorted[sorted.length - 1] && sorted[sorted.length - 1]['@type'],
    dateLastRapidReview: getDateLastRapidReview(preprint.rapidReviews),
    dateLastLongReview: getDateLastLongReview(publishedReviews),
    dateLastRequest: getDateLastRequest(preprint.requests),
    isAnimating: isAnimating,
  };
}

function getDateLastRequest(requests) {
  if (!requests || !requests.length) return;

  return requests[requests.length - 1].updatedAt;
}

function getDateLastRapidReview(rapidReviews) {
  if (!rapidReviews || !rapidReviews.length) return;

  return rapidReviews[rapidReviews.length - 1].updatedAt;
}

function getDateLastLongReview(longReviews) {
  if (!longReviews || !longReviews.length) return;

  return longReviews[longReviews.length - 1].updatedAt;
}
