// base imports
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import mobile from 'is-mobile';
import Shell from './shell';
import ShellContent from './shell-content';
import NotFound from './not-found';
import { ORG } from '../constants';
// import { unprefix } from '../utils/jsonld';

// module imports
import CollabEditor from './collab-editor';
import PdfViewer from './pdf-viewer';

export default function Review() {
  const location = useLocation(); // location.state can be {preprint, tab} with tab being `request` or `review` (so that we know on which tab the shell should be activated with
  // const { identifierPart1, identifierPart2 } = useParams();
  const identifier = useState('2007.09477');
  // .filter(Boolean)
  // .join('/');

  const isMobile = useMemo(() => mobile({ tablet: true }), []);

  // See https://github.com/PREreview/rapid-prereview/issues/13
  // Drag and drop over a PDF object is currently broken in Chrome for Mac
  // Bug is tracked here: https://bugs.chromium.org/p/chromium/issues/detail?id=984891&q=drag%20object&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Component%20Status%20Owner%20Summary%20OS%20Modified
  const [isChromeOnMac, setIsChroneOnMac] = useState(false);

  const [preprint, fetchPreprintProgress] = useState(identifier);

  if (
    fetchPreprintProgress.error &&
    fetchPreprintProgress.error.statusCode >= 400
  ) {
    return <NotFound />;
  }

  let preprintId = preprint;
  const pdfUrl = 'https://arxiv.org/pdf/2007.09477';
  const canonicalUrl = 'https://arxiv.org/pdf/2007.09477';

  useEffect(() => {
    if (window) {
      setIsChroneOnMac(!!window.chrome && navigator.platform.includes('Mac'));
    }
  }, []);

  return (
    <div className="extension-fallback">
      <Helmet>
        <title>{ORG} • Review demo</title>
      </Helmet>

      {pdfUrl ? (
        isMobile || isChromeOnMac ? (
          /* for mobile devices we always use the fallback */
          <PdfViewer docId={preprintId} loading={'Loading PDF'} />
        ) : (
          <object
            key={pdfUrl}
            data={pdfUrl}
            // type="application/pdf" commented out as it seems to break pdf loading in safari
            // typemustmatch="true" commented out as it doesn't seem to be currently supported by react
          >
            {/* fallback text in case we can't load the PDF */}
            <PdfViewer docId={identifier} loading={'Loading PDF'} />
          </object>
        )
      ) : preprint && !pdfUrl ? (
        <div className="extension-fallback__no-pdf-message">
          <div>
            No PDF available.
            {!!canonicalUrl && (
              <span>
                {` `}You can visit{' '}
                {
                  <a
                    href={canonicalUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {canonicalUrl}
                  </a>
                }{' '}
                for more information on the document.
              </span>
            )}
          </div>
        </div>
      ) : null}

      <Shell>
        {onRequireScreen =>
          !!preprint && (
            <ShellContent
              onRequireScreen={onRequireScreen}
              preprint={preprint}
              defaultTab={location.state && location.state.tab}
            />
          )
        }
      </Shell>
    </div>
  );
}
