// base imports
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ORG } from '../constants';

// module imports
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
