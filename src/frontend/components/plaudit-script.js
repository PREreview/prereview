import React, { useState, useEffect } from 'react';
// import makeAsyncScriptLoader from 'react-async-script'; 


export default function useScript(src) {
  // Keep track of script status ("idle", "loading", "ready", "error")

  const [status, setStatus] = useState(src ? 'loading' : 'idle');

  useEffect(
    () => {
      // Allow falsy src value if waiting on other data needed for
      // constructing the script URL passed to this hook.

      if (!src) {
        setStatus('idle');
        return;
      }

      // Fetch existing script element by src
      let scriptTag = document.querySelector(`script[src="${src}"]`);

      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.src = src;
        scriptTag.setAttribute('data-status', 'loading');
        scriptTag.setAttribute('data-embedder-id', 'prereview');

        let plauditDiv = document.getElementById('plaudits-div')

        plauditDiv ? plauditDiv.appendChild(scriptTag) : document.body.appendChild(scriptTag)

        // Store status in attribute on script
        // This can be read by other instances of this hook
        const setAttributeFromEvent = event => {
          scriptTag.setAttribute(
            'data-status',
            event.type === 'load' ? 'ready' : 'error',
          );
        };

        scriptTag.addEventListener('load', setAttributeFromEvent);
        scriptTag.addEventListener('error', setAttributeFromEvent);
      } else {
        // Grab existing script status from attribute and set to state.
        setStatus(scriptTag.getAttribute('data-status'));
      }

      // Script event handler to update status in state
      // Note: Even if the script already exists we still need to add
      // event handlers to update the state for *this* hook instance.
      const setStateFromEvent = event => {
        setStatus(event.type === 'load' ? 'ready' : 'error');
      };

      // Add event listeners
      scriptTag.addEventListener('load', setStateFromEvent);
      scriptTag.addEventListener('error', setStateFromEvent);

      // Remove event listeners on cleanup
      return () => {
        if (scriptTag) {
          scriptTag.removeEventListener('load', setStateFromEvent);
          scriptTag.removeEventListener('error', setStateFromEvent);
        }
      };
    },
    [src], // Only re-run effect if script src changes
  );

  return <p>Endorsements</p>
}
