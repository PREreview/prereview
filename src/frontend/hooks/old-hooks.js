import { useState, useEffect } from 'react';
import { createError } from '../utils/errors';
import { unprefix } from '../utils/jsonld';
import { useStores } from '../contexts/store-context';

/**
 * Get Preprint metadata from `identifier`
 */
export function usePreprint(
  identifier, // arXivId or DOI
  prefetchedPreprint,
  fallbackUrl, // a URL to use in case `identifier` hasn't been registered with the DOI service yet (e.g., crossref)
  community,
) {
  identifier = unprefix(identifier);

  const [progress, setProgress] = useState({
    isActive: false,
    error: null,
  });

  const [preprint, setPreprint] = useState(null);

  const { preprintsWithActionsStore } = useStores();

  useEffect(() => {
    if (identifier) {
      let cached;
      if (
        prefetchedPreprint &&
        unprefix(prefetchedPreprint.doi || prefetchedPreprint.arXivId) ===
          identifier
      ) {
        cached = prefetchedPreprint;
      } else if (preprintsWithActionsStore.has(identifier)) {
        cached = preprintsWithActionsStore.get(identifier, { actions: false });
      }

      if (cached) {
        setProgress({
          isActive: false,
          error: null,
        });
        setPreprint(cached);
      } else {
        setProgress({
          isActive: true,
          error: null,
        });
        setPreprint(null);

        const controller = new AbortController();

        fetch(
          `/api/v2/resolve?identifier=${encodeURIComponent(identifier)}${
            fallbackUrl ? `&url=${encodeURIComponent(fallbackUrl)}` : ''
          }${community ? `&community=${encodeURIComponent(community)}` : ''}`,
          {
            signal: controller.signal,
          },
        )
          .then(resp => {
            if (resp.ok) {
              return resp.json();
            } else {
              return resp.json().then(
                body => {
                  throw createError(resp.status, body.description || body.name);
                },
                err => {
                  throw createError(resp.status, 'something went wrong');
                },
              );
            }
          })
          .then(data => {
            preprintsWithActionsStore.set(data, {
              onlyIfNotExisting: true,
              emit: false,
            });
            setPreprint(data);
            return setProgress({ isActive: false, error: null });
          })
          .catch(err => {
            if (err.name !== 'AbortError') {
              setProgress({ isActive: false, error: err });
              setPreprint(null);
            }
          });

        return () => {
          controller.abort();
        };
      }
    } else {
      setProgress({
        isActive: false,
        error: null,
      });
      setPreprint(null);
    }
  }, [identifier, fallbackUrl, prefetchedPreprint, preprintsWithActionsStore]);

  return [preprint, progress];
}
