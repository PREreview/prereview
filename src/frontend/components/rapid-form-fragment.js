import React, { useState } from 'react';
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

const StyledTableCell = withStyles(() => ({
  root: {
    borderBottom: 'none',
  },
  body: {
    fontSize: 14,
    // minWidth: '250px',
  },
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
  root: {
    borderBottom: 'none',
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child': {
      backgroundColor: '#fff',
    },
  },
}))(TableRow);

const useStyles = makeStyles({
  relative: {
    position: 'relative',
  },
  table: {
    borderBottom: 'none',
    maxHeight: 650,
  },
  textAnswer: {
    // display: 'inline-block',
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
              <StyledTableCell>
                <div className="vh">Question</div>
              </StyledTableCell>
              <StyledTableCell align="left">Yes</StyledTableCell>
              <StyledTableCell align="left">No</StyledTableCell>
              <StyledTableCell align="left">N/A</StyledTableCell>
              <StyledTableCell align="left">Unsure</StyledTableCell>
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
                  <StyledTableCell align="right">
                    <RadioButton
                      required={required}
                      inputId={`question-${identifier}-yes`}
                      name={identifier}
                      value="yes"
                      checked={answer === 'yes'}
                      onChange={() => {
                        handleChange(identifier, 'yes');
                      }}
                      label="Yes"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <RadioButton
                      required={required}
                      inputId={`question-${identifier}-no`}
                      name={identifier}
                      value="no"
                      checked={answer === 'no'}
                      onChange={() => {
                        handleChange(identifier, 'no');
                      }}
                      label="No"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <RadioButton
                      required={required}
                      inputId={`question-${identifier}-na`}
                      name={identifier}
                      value="N/A"
                      checked={answer === 'N/A'}
                      onChange={() => {
                        handleChange(identifier, 'N/A');
                      }}
                      label={<abbr title="Not Applicable">N/A</abbr>}
                    />
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <RadioButton
                      required={required}
                      inputId={`question-${identifier}-unsure`}
                      name={identifier}
                      value="unsure"
                      checked={answer === 'unsure'}
                      onChange={() => {
                        handleChange(identifier, 'unsure');
                      }}
                      label="Unsure"
                    />
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                <StyledTableRow key={identifier} className={classes.textAnswer}>
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
                  <StyledTableCell align="right" className={classes.relative}>
                    <input
                      type="text"
                      required={required}
                      className="radid-form-fragment__text-answer"
                      id={`question-${identifier}`}
                      name={identifier}
                      value={answer || ''}
                      onChange={e => {
                        handleChange(identifier, e.target.value);
                      }}
                    />
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

RapidFormFragment.propTypes = {
  onChange: PropTypes.func.isRequired,
  answerMap: PropTypes.object,
};
