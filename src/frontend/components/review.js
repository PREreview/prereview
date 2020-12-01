// base imports
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
// import { unprefix } from '../utils/jsonld';
import { ORG } from '../constants';

// module imports
// import { EditorWrapper } from './editor';
import CollabEditor from './collab-editor';

export default function Review() {
  return (
    <div className="">
      <Helmet>
        <title>{ORG} • Review demo</title>
      </Helmet>

      <CollabEditor />
    </div>
  );
}
