import React from 'react';
import ReactDOM from 'react-dom';
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';

export function Button({ className, active, reversed, ...props }) {
  return (
    <span
      {...props}
      className={jsx(
        className,
        css`
          cursor: pointer;
          color: ${reversed
            ? active
              ? 'white'
              : '#aaa'
            : active
            ? 'black'
            : '#ccc'};
        `,
      )}
    />
  );
}

Button.propTypes = {
  className: PropTypes.string,
  active: PropTypes.bool,
  reversed: PropTypes.bool,
};

export const EditorValue = React.forwardRef(
  ({ className, value, ...props }, ref) => {
    const textLines = value.document.nodes
      .map(node => node.text)
      .toArray()
      .join('\n');
    return (
      <div
        ref={ref}
        {...props}
        className={jsx(
          className,
          css`
            margin: 30px -20px 0;
          `,
        )}
      >
        <div
          className={css`
            font-size: 14px;
            padding: 5px 20px;
            color: #404040;
            border-top: 2px solid #eeeeee;
            background: #f8f8f8;
          `}
        >
          Slate&apos;s value as text
        </div>
        <div
          className={css`
            color: #404040;
            font: 12px monospace;
            white-space: pre-wrap;
            padding: 10px 20px;
            div {
              margin: 0 0 0.5em;
            }
          `}
        >
          {textLines}
        </div>
      </div>
    );
  },
);

EditorValue.displayName = 'EditorValue';
EditorValue.propTypes = {
  className: PropTypes.string,
  value: PropTypes.any,
};

export const Icon = ({ className, ...props }) => {
  return (
    <span
      {...props}
      className={jsx(
        'material-icons',
        className,
        css`
          font-size: 18px;
          vertical-align: text-bottom;
        `,
      )}
    />
  );
};

Icon.propTypes = {
  className: PropTypes.string,
};

export const Instruction = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={jsx(
      className,
      css`
        white-space: pre-wrap;
        margin: 0 -20px 10px;
        padding: 10px 20px;
        font-size: 14px;
        background: #f8f8e8;
      `,
    )}
  />
));

Instruction.displayName = 'Instruction';
Instruction.propTypes = {
  className: PropTypes.string,
};

export const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={jsx(
      className,
      css`
        & > * {
          display: inline-block;
        }

        & > * + * {
          margin-left: 15px;
        }
      `,
    )}
  />
));

Menu.displayName = 'Menu';
Menu.propTypes = {
  className: PropTypes.string,
};

export const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

const Toolbar = ({ className, ...props }) => {
  return (
    <Menu
      {...props}
      className={jsx(
        className,
        css`
          position: relative;
          padding: 1px 18px 17px;
          margin: 0 -20px;
          border-bottom: 2px solid #eee;
          margin-bottom: 20px;
        `,
      )}
    />
  );
};

Toolbar.displayName = 'Toolbar';
Toolbar.propTypes = {
  className: PropTypes.string,
};

export default Toolbar;
