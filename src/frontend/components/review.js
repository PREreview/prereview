// base imports
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ORG } from '../constants';

// module imports
import CollabEditor from './collab-editor';

export default function Review() {
  return (
    <article className="review">
      <Helmet>
        <title>{ORG} • Test Longform Review</title>
      </Helmet>

      <h1>Test Longform Review</h1>

      <CollabEditor />
    </article>
  );
}
