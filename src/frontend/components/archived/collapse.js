import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

export default function Collapse({ isOpened, children }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(isOpened ? 'auto' : 0);

  const prevIsOpenedRef = useRef(null);
  useEffect(() => {
    prevIsOpenedRef.current = isOpened;
  });

  useEffect(() => {
    const element = ref.current;
    if (isOpened) {
      // opening case (transitionning from close)
      if (element && prevIsOpenedRef.current !== null) {
        // transition from 0px to the height of the element inner content
        // (the element height is 0px when closed)
        // This is because CSS transition on height doesn't work with `auto`
        const scrollHeight = element.scrollHeight;
        setHeight(scrollHeight);
      }
    } else {
      element.removeAttribute('height');
      setHeight(0);
    }
  }, [isOpened]);

  return (
    <div className="collapse" ref={ref} style={{ height }}>
      {isOpened || (prevIsOpenedRef.current && !isOpened) ? children : null}
    </div>
  );
}

Collapse.propTypes = {
  children: PropTypes.any,
  isOpened: PropTypes.bool.isRequired,
};
