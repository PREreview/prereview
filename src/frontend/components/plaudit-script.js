import React, { useState } from 'react';
import makeAsyncScriptLoader from "react-async-script";

const PLAUDITURL = 'https://plaudit.pub/embed/endorsements.js'
const DATAATTR = { 'data-embedder-id': 'prereview' }

const Plaudit = () => {
  return <div>Endorsements</div>
}

export default function PlauditScript() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  const handleScriptLoad = () => {
    setIsScriptLoaded(true)
  }

  isScriptLoaded ? console.log('Plaudit.pub script loaded') : console.log('Plaudit nowhere to be found')

  const loadingElement = () => {
    return <div>Loading...</div>;
  };

  let AsyncScriptComponent;

  isScriptLoaded ? AsyncScriptComponent = makeAsyncScriptLoader(PLAUDITURL, DATAATTR)(Plaudit) : AsyncScriptComponent = makeAsyncScriptLoader(PLAUDITURL, DATAATTR)(loadingElement)

  return <AsyncScriptComponent asyncScriptOnLoad={handleScriptLoad} />
}

