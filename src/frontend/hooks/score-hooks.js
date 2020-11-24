import { useState, useEffect, useCallback } from 'react';

/**
 * Note actions should always have a length of at least 1 as only preprint
 * with reviews or requests for reviews are listed
 */
export function useAnimatedScore(preprint, now = new Date().toISOString()) {
  return {
    nRequests: preprint.requests.length,
    nReviews: preprint.fullReviews.length + preprint.rapidReviews.length,
    now: now,
    dateFirstActivity: now,
    dateLastActivity: now,
    lastActionType: 'RapidPrereviewAction',
    dateLastReview: now,
    dateLastRequest: now,
    onStartAnim: () => {},
    onStopAnim: () => {},
    isAnimating: false,
  };
  console.log('***preprint***:', preprint);
  const sorted = preprint.reviews
    ? preprint.requests
      ? preprint.reviews.concat(preprint.requests).sort((a, b) => {
          return (
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
        })
      : preprint.reviews.sort((a, b) => {
          return (
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
        })
    : [];

  console.log('***sorted***:', sorted);
  const [index, setIndex] = useState(null);

  const [isAnimating, setIsAnimating] = useState(false);

  let nRequests = 0;
  let nReviews = 0;
  let handleStopAnim, handleStartAnim;
  let playedTime = new Date();

  if (sorted.length) {
    const tmin = new Date(sorted[0].startTime).getTime();
    const tmax = Math.max(
      new Date(now).getTime(),
      new Date(sorted[sorted.length - 1].startTime).getTime(),
    );

    // if all the actions are at the beginning and all happened a while ago, the animation is
    // going to be uggly with all the numbers changing without the circle growing
    // => In those case we just pretent that all the actions were posted regularly
    // and one after another
    const prettify =
      new Date(now).getTime() -
        new Date(sorted[sorted.length - 1].startTime).getTime() >
      2 *
        (new Date(sorted[sorted.length - 1].startTime).getTime() -
          new Date(sorted[0].startTime).getTime());

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
          const t = new Date(
            sorted[Math.max(index - 1, 0)].startTime,
          ).getTime();
          const nextT = new Date(
            index >= sorted.length - 1
              ? now
              : sorted[Math.max(index, 0)].startTime,
          ).getTime();

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

    nRequests =
      index === -1
        ? 0
        : getNRequests(
            sorted.slice(
              0,
              index === null || index >= sorted.length
                ? sorted.length
                : index + 1,
            ),
          );
    nReviews =
      index === -1
        ? 0
        : getNReviews(
            sorted.slice(
              0,
              index === null || index >= sorted.length
                ? sorted.length
                : index + 1,
            ),
          );

    if (index === null || index >= sorted.length) {
      playedTime = now;
      console.log('in if');
    } else if (index === -1) {
      playedTime = sorted[0] && sorted[0].startTime;
      console.log('in else 1');
    } else if (prettify) {
      console.log('in else 2');
      playedTime = new Date(
        (index / (sorted.length - 1)) * (tmax - tmin) + tmin,
      ).toISOString();
    } else {
      console.log('in last else');
      playedTime = sorted[index].startTime;
    }
  }

  return {
    nRequests,
    nReviews,
    now: playedTime,
    dateFirstActivity: sorted[0] && sorted[0].startTime,
    dateLastActivity:
      sorted[sorted.length - 1] && sorted[sorted.length - 1].startTime,
    lastActionType:
      sorted[sorted.length - 1] && sorted[sorted.length - 1]['@type'],
    dateLastReview: getDateLastReview(sorted),
    dateLastRequest: getDateLastRequest(sorted),
    onStartAnim: handleStartAnim,
    onStopAnim: handleStopAnim,
    isAnimating: isAnimating,
  };
}

function getNReviews(actions) {
  return actions.reduce((count, action) => {
    if (action['@type'] === 'RapidPREreviewAction') {
      count++;
    }
    return count;
  }, 0);
}

function getNRequests(actions) {
  return actions.reduce((count, action) => {
    if (action['@type'] === 'RequestForRapidPREreviewAction') {
      count++;
    }
    return count;
  }, 0);
}

function getDateLastRequest(sorted) {
  if (!sorted) return;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i]['@type'] === 'RequestForRapidPREreviewAction') {
      return sorted[i].startTime;
    }
  }
}

function getDateLastReview(sorted) {
  if (!sorted) return;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i]['@type'] === 'RapidPREreviewAction') {
      return sorted[i].startTime;
    }
  }
}
