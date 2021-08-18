import { useState, useEffect } from 'react';
import { useStores } from '../contexts/store-context';

/**
 * Assess if the visitor lands on rapid PREreview for the first time
 */
export function useIsNewVisitor() {
  const [isNewVisitor, setIsNewVisitor] = useState(null);

  useEffect(() => {
    if (localStorage) {
      setIsNewVisitor(localStorage.getItem('isNewVisitor') !== 'false');
      localStorage.setItem('isNewVisitor', 'false');
    }
  }, []);

  return isNewVisitor;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    function onFirstMount() {
      const mql = window.matchMedia('(max-width: 900px)');

      setIsMobile(mql.matches);
    }
  }, []);

  return null;
}

export function useNewPreprints() {
  const { preprintsSearchResultsStore, newPreprintsStore } = useStores();

  const [newPreprints, _setNewPreprints] = useState(newPreprintsStore.get());

  useEffect(() => {
    // keep `newPreprints` up-to-date
    function update(newPreprints) {
      _setNewPreprints(newPreprints);
    }

    newPreprintsStore.addListener('SET', update);

    return () => {
      newPreprintsStore.removeListener('SET', update);
    };
  }, [newPreprintsStore]);

  useEffect(() => {
    // reset newPreprint on search changes
    function reset() {
      _setNewPreprints([]);
    }

    preprintsSearchResultsStore.addListener('SET', reset);

    return () => {
      preprintsSearchResultsStore.removeListener('SET', reset);
    };
  }, [preprintsSearchResultsStore]);

  function setNewPreprints(newPreprints) {
    newPreprintsStore.set(newPreprints);
  }

  return [newPreprints, setNewPreprints];
}
