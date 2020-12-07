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

export default function RapidFormFragment({ answerMap = {}, onChange }) {
  const classes = useStyles();

  function handleChange(key, value) {
    onChange(key, value);
  }

  const [isOpenedMap, setIsOpenedMap] = useState(
    QUESTIONS.filter(q => q.type == 'YesNoQuestion').reduce((map, q) => {
      map[q.identifier] = false;
      return map;
    }, {}),
  );

  return (
    <div className="rapid-form-fragment">
      <TableContainer>
        <Table
          stickyHeader
          className={classes.table}
          aria-label="questions table"
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <div className="vh">Question</div>
              </TableCell>
              <TableCell align="right">Yes</TableCell>
              <TableCell align="right">No</TableCell>
              <TableCell align="right">N/A</TableCell>
              <TableCell align="right">Unsure</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {QUESTIONS.map(({ type, identifier, question, help, required }) => {
              const answer = answerMap[identifier];
              return type == 'YesNoQuestion' ? (
                <StyledTableRow key={identifier}>
                  <StyledTableCell
                    component="th"
                    scope="row"
                    className="radid-form-fragment__question"
                  >
                    <Value tagName="p">{question}</Value>

                    {!!help && (
                      <IconButton
                        className="radid-form-fragment__help"
                        onClick={e => {
                          e.preventDefault();
                          setIsOpenedMap(
                            Object.assign({}, isOpenedMap, {
                              [identifier]: !isOpenedMap[identifier],
                            }),
                          );
                        }}
                      >
                        <MdHelpOutline />
                      </IconButton>
                    )}
                    <Collapse isOpened={isOpenedMap[identifier]}>
                      <Value
                        tagName="p"
                        className="rapid-form-fragment__help-text"
                      >
                        {help}
                      </Value>
                    </Collapse>
                  </StyledTableCell>
                  <TableCell align="right">
                    <RadioButton
                      required={required}
                      inputId={`question-${identifier}-yes`}
                      name={identifier}
                      value="yes"
                      checked={answer === 'yes'}
                      onChange={e => {
                        handleChange(identifier, 'yes');
                      }}
                      label="Yes"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <RadioButton
                      required={required}
                      inputId={`question-${identifier}-no`}
                      name={identifier}
                      value="no"
                      checked={answer === 'no'}
                      onChange={e => {
                        handleChange(identifier, 'no');
                      }}
                      label="No"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <RadioButton
                      required={required}
                      inputId={`question-${identifier}-na`}
                      name={identifier}
                      value="n.a."
                      checked={answer === 'n.a.'}
                      onChange={e => {
                        handleChange(identifier, 'n.a.');
                      }}
                      label={<abbr title="Not Applicable">N.A.</abbr>}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <RadioButton
                      required={required}
                      inputId={`question-${identifier}-unsure`}
                      name={identifier}
                      value="unsure"
                      checked={answer === 'unsure'}
                      onChange={e => {
                        handleChange(identifier, 'unsure');
                      }}
                      label="Unsure"
                    />
                  </TableCell>
                </StyledTableRow>
              ) : (
                <StyledTableRow key={identifier}>
                  <StyledTableCell
                    component="th"
                    scope="row"
                    className="radid-form-fragment__question"
                  >
                    <Value tagName="p">{question}</Value>

                    {!!help && (
                      <IconButton
                        className="radid-form-fragment__help"
                        onClick={e => {
                          e.preventDefault();
                          setIsOpenedMap(
                            Object.assign({}, isOpenedMap, {
                              [identifier]: !isOpenedMap[identifier],
                            }),
                          );
                        }}
                      >
                        <MdHelpOutline />
                      </IconButton>
                    )}
                  </StyledTableCell>
                  <TableCell align="right" className={classes.relative}>
                    <textarea
                      required={required}
                      className="radid-form-fragment__text-answer"
                      id={`question-${identifier}`}
                      name={identifier}
                      rows="2"
                      value={answer || ''}
                      onChange={e => {
                        handleChange(identifier, e.target.value);
                      }}
                    />
                  </TableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
    </TableContainer>
      <NoticeBox type="warning">
        Beta Notice: Please note that any reviews submitted during the beta
        stage of Outbreak Science Rapid PREreview will be migrated over into
        future updates.
      </NoticeBox>
    </div>
  );
}

RapidFormFragment.propTypes = {
  onChange: PropTypes.func.isRequired,
  answerMap: PropTypes.object,
};
