import React, { Fragment } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

// MaterialUI components
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

// icons
import { MdHelpOutline } from 'react-icons/md';

// constants
import { QUESTIONS } from '../constants';

// components
import CollabEditor from './collab-editor';

const useStyles = makeStyles({
  relative: {
    position: 'relative',
  },
  table: {
    maxHeight: 650,
  },
});

export default function LongFormFragment({ content, onContentChange }) {
  const handleContentChange = value => {
    onContentChange(value);
  }

  return (
    <div className="rapid-form-fragment">
      <fieldset className="rapid-form-fragment__text-response-questions">
        <Fragment key={'longform'}>
          <div className="remirror-container">
            <CollabEditor
              initialContent={content}
              handleContentChange={handleContentChange}
            />
          </div>
        </Fragment>
      </fieldset>
    </div>
  );
}

LongFormFragment.propTypes = {
  content: PropTypes.string.isRequired,
  onContentChange: PropTypes.func.isRequired,
  answerMap: PropTypes.object,
};
