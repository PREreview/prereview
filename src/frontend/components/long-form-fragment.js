import React, { Fragment, useState, useEffect } from 'react';
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
import Value from './value';
import RadioButton from './radio-button';
import IconButton from './icon-button';
import Collapse from './collapse';
import NoticeBox from './notice-box';
import CollabEditor from './collab-editor';

const StyledTableCell = withStyles((theme) => ({
  body: {
    fontSize: 14,
    minWidth: '250px',
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const useStyles = makeStyles({
  relative: {
    position: 'relative',
  },
  table: {
    maxHeight: 650,
  },
});

export default function LongFormFragment({ onChange }) {
  const classes = useStyles();

  function handleChange(key, value) {
    onChange(key, value);
  }

  return (
    <div className="rapid-form-fragment">
      <fieldset className="rapid-form-fragment__text-response-questions">
        <Fragment key={'longform'}>
          <div className="remirror-container">
            <CollabEditor />
          </div>
        </Fragment>
      </fieldset>
      <NoticeBox type="warning">
        Beta Notice: Please note that any reviews submitted during the beta
        stage of Outbreak Science Rapid PREreview will be migrated over into
        future updates.
      </NoticeBox>
    </div>
  );
}

LongFormFragment.propTypes = {
  onChange: PropTypes.func.isRequired,
  answerMap: PropTypes.object,
};
