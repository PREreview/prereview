import React from 'react';

// components
import XLink from './xlink';

export default function ActiveUser({user}) {
  const userId = user.split(', ')[0]
  const name = user.split(', ')[1]

  return <>
     <XLink to={`/about/${userId}`}>{name}</XLink>
  </>
}