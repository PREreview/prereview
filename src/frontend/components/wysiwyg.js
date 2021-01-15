import React, { forwardRef } from 'react';

import { useRemirrorTheme } from '@remirror/ui';
import { ResetButton } from '@remirror/ui-buttons';

export const Menu = forwardRef((props, ref) => {
  const { sx } = useRemirrorTheme();

  return (
    <div
      {...props}
      ref={ref}
      css={sx({
        '& > button': {
          display: 'inline-block',
        },
      })}
    />
  );
});

Menu.displayName = 'Menu';

export const Toolbar = props => {
  const { sx } = useRemirrorTheme();

  return (
    <Menu
      {...props}
      css={sx({
        position: 'relative',
        padding: '1px 28px 17px',
        margin: '0 -20px',
        borderBottom: '2px solid #eee',
        marginBottom: '20px',
      })}
    />
  );
};

export const IconButton = forwardRef((props, ref) => {
  const { sx } = useRemirrorTheme();

  return (
    <ResetButton
      {...props}
      ref={ref}
      css={sx(
        {
          marginLeft: props.index !== 0 ? 3 : 0,
        },
        props.css,
      )}
    />
  );
});

IconButton.displayName = 'IconButton';

/**
 * Allows positioners to work.
 */
export const EditorWrapper = forwardRef((props, ref) => {
  const { sx } = useRemirrorTheme();

  return <div {...props} ref={ref} css={sx({ position: 'relative' })} />;
});

EditorWrapper.displayName = 'EditorWrapper';

export const BubbleMenuTooltip = forwardRef((props, ref) => {
  const { css } = useRemirrorTheme();

  return (
    <span
      {...props}
      ref={ref}
      css={css`
        z-index: 10;
        position: absolute;
        bottom: ${props.bottom}px;
        left: ${props.left}px;
        padding-bottom: 9px;
        transform: translateX(-50%);
      `}
    />
  );
});

BubbleMenuTooltip.displayName = 'BubbleMenuTooltip';

export const BubbleContent = forwardRef((props, ref) => {
  const { css } = useRemirrorTheme();

  return (
    <span
      {...props}
      ref={ref}
      css={css`
        background: black;
        border-radius: 3px;
        color: white;
        font-size: 0.75rem;
        line-height: 1.4;
        padding: 0.75em;
        text-align: center;
        display: flex;
      `}
    />
  );
});

BubbleContent.displayName = 'BubbleContent';
