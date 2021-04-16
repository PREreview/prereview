// base imports
import React, { useState, useEffect, useContext } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import clsx from 'clsx';
import isURL from 'validator/lib/isURL';

// material ui
import {
  ThemeProvider,
  createMuiTheme,
  makeStyles,
  withStyles,
} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Check from '@material-ui/icons/Check';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Link from '@material-ui/core/Link';
import MenuItem from '@material-ui/core/MenuItem';
import Modal from '@material-ui/core/Modal';
import MuiAlert from '@material-ui/lab/Alert';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepConnector from '@material-ui/core/StepConnector';
import StepLabel from '@material-ui/core/StepLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { v4 as uuidv4 } from 'uuid';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import {
  useGetUserTemplates,
  usePostFullReviews,
  usePostRapidReviews,
  usePutFullReview,
} from '../hooks/api-hooks.tsx';

// components
import AddAuthors from './add-authors';
import RapidFormFragment from './rapid-form-fragment';
import LongFormFragment from './long-form-fragment';

// constants
import { QUESTIONS } from '../constants';

const prereviewTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#F77463',
      contrastText: '#fff',
    },
    secondary: {
      main: '#eaeaf0',
    },
  },
  typography: {
    fontFamily: ['Open Sans', 'sans-serif'].join(','),
  },
});

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  button: {
    marginRight: theme.spacing(1),
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  completed: {
    display: 'inline-block',
  },
  fullWidth: {
    padding: 5,
    width: '100%',
  },
  input: {
    border: '1px solid #ccc',
    margin: 15,
    padding: 10,
    width: '98%',
  },
  inputLabel: {
    color: 'rgba(0, 0, 0, 0.87)',
    margin: '0 15px',
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  label: {
    textAlign: 'center',
  },
  loading: {
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
  modal: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    left: `50%`,
    minWidth: 300,
    padding: theme.spacing(2, 4, 3),
    position: 'absolute',
    top: `50%`,
    transform: `translate(-50%, -50%)`,
  },
  paper: {
    padding: '1rem',
  },
  red: {
    backgroundColor: '#FAB7B7',
    margin: '0 15px',
    padding: 10,
  },
  redLink: {
    color: '#000 !important',
    textDecoration: 'underline',
  },
  select: {
    marginTop: '1rem',
    width: '100%',
  },
  template: {},
  yellow: {
    backgroundColor: '#FFFAEE',
    lineHeight: '1.4',
    padding: 10,
  },
}));

const QontoConnector = withStyles({
  alternativeLabel: {
    top: 10,
    left: 'calc(-50% + 21px)',
    right: 'calc(50% + 21px)',
  },
  active: {
    '& $line': {
      borderColor: '#F77463',
    },
  },
  completed: {
    '& $line': {
      borderColor: '#F77463',
    },
  },
  line: {
    borderColor: '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
  },
})(StepConnector);

const useQontoStepIconStyles = makeStyles({
  root: {
    color: '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
    position: 'relative',
    '&:before': {
      border: '1px solid #eaeaf0',
      borderRadius: '50%',
      content: "''",
      height: 40,
      left: '50%',
      position: 'absolute',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: 40,
    },
  },
  active: {
    color: '#F77463',
    '&:before': {
      borderColor: '#F77463',
    },
    '&:after': {
      borderLeft: '13px solid transparent',
      borderRight: '13px solid transparent',
      borderTop: '20px solid #eaeaf0',
      content: "''",
      height: 0,
      left: '50%',
      position: 'absolute',
      top: '-36px',
      transform: 'translateX(-50%)',
      width: 0,
    },
  },
  circle: {
    borderRadius: '50%',
    backgroundColor: 'currentColor',
    height: 30,
    width: 30,
  },
  completed: {
    backgroundColor: '#F77463',
    borderRadius: '50%',
    color: '#fff',
    fontSize: 22,
    padding: 5,
    position: 'relative',
    zIndex: 1,
    '&:before': {
      borderColor: '#F77463',
    },
  },
});

function QontoStepIcon(props) {
  const classes = useQontoStepIconStyles();
  const { active, completed } = props;

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
    >
      {completed ? (
        <Check className={classes.completed} />
      ) : (
        <div className={classes.circle} />
      )}
    </div>
  );
}

QontoStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
};

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function ReviewStepper({
  preprint,
  onClose,
  hasRapidReviewed,
  hasLongReviewed,
  content,
  onContentChange,
  onReviewChange,
  review,
}) {
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();
  const { cid } = useParams();
  const [thisUser, setThisUser] = useContext(UserProvider.context);
  const [activeStep, setActiveStep] = useState(0);
  const [answerMap, setAnswerMap] = useState({});
  const [completed, setCompleted] = useState(new Set());
  const [expandFeedback, setExpandFeedback] = useState(false);
  const [disabledSubmit, setDisabledSubmit] = useState(false);
  const [reviewId, setReviewId] = useState(review ? review.parent : uuidv4());
  const [skipped, setSkipped] = useState(new Set());
  const steps = getSteps();
  // API queries
  const { data: templates } = useGetUserTemplates({
    uid: thisUser.uuid,
  });
  const { mutate: postRapidReview } = usePostRapidReviews();
  const { mutate: postLongReview, loading } = usePostFullReviews();
  const { mutate: putLongReview } = usePutFullReview({ id: cid });

  // handle open/close templates
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // handle open/close copy success
  const [openCopied, setOpenCopied] = React.useState(false);

  const handleCopied = () => {
    setOpenCopied(true);
  };

  const handleCloseCopied = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenCopied(false);
  };

  const [template, setTemplate] = useState('');

  const handleTemplateChange = contents => {
    setTemplate(contents);
  };

  // react html parser functionality
  const transform = node => {
    if (node.attribs) {
      if (node.attribs.class === 'ql-editor') {
        node.attribs.class = '';
        node.attribs.contenteditable = false;
      } else if (
        node.attribs.class === 'ql-clipboard' ||
        node.attribs.class === 'ql-tooltip ql-hidden'
      ) {
        return null;
      }
    }
    return convertNodeToElement(node);
  };

  // react html parser options
  const options = {
    decodeEntities: true,
    transform,
  };

  // handle submit functions
  const canSubmitRapid = answerMap => {
    if (
      !QUESTIONS.filter(q => q.type == 'YesNoQuestion').every(
        question => question.identifier in answerMap,
      )
    ) {
      alert(
        'Please complete the required fields. All multiple choice questions are required.',
      );
      return false;
    }

    if (answerMap.ynAvailableData === 'yes' && !answerMap.linkToData) {
      alert(
        `If you indicated the data used in the preprint is available, you must include the link to available data.`,
      );
      return false;
    }
    if (answerMap.ynAvailableData === 'yes' && !isURL(answerMap.linkToData)) {
      alert(`The link to available data must be a valid URL.`);
      return false;
    }

    return true;
  };

  const canSubmitLong = content => {
    return content && content !== '<p></p>';
  };

  const handleSubmitRapid = () => {
    if (!hasRapidReviewed) {
      if (canSubmitRapid(answerMap)) {
        postRapidReview({ ...answerMap, preprint: preprint.uuid })
          .then(() => {
            onClose(answerMap);
            return;
          })
          .catch(err => {
            alert(`An error occurred: ${err.message}`);
            return false;
          });
      }
      return;
    }
  };

  const handleSaveLong = event => {
    event.preventDefault();
    if (canSubmitLong(content)) {
      if (cid) {
        putLongReview({
          contents: content,
          authors:
            review && review.authors
              ? review.authors.reduce((authors, author) => {
                  if (author.uuid) {
                    authors.push({ uuid: author.uuid });
                  }
                  return authors;
                }, [])
              : null,
        })
          .then(() => alert('Draft updated successfully.'))
          .catch(err => alert(`An error occurred: ${err.message}`));
      } else {
        postLongReview({
          preprint: preprint.uuid,
          contents: content,
          authors:
            review && review.authors
              ? review.authors.reduce((authors, author) => {
                  if (author.uuid) {
                    authors.push({ uuid: author.uuid });
                  }
                  return authors;
                }, [])
              : null,
        })
          .then(response => {
            alert('Draft updated successfully.');
            setReviewId(response.body.uuid);
            onReviewChange(response.body);
            return history.push(
              `${location.pathname}/drafts/${response.body.uuid}`,
            );
          })
          .catch(err => alert(`An error occurred: ${err.message}`));
      }
    } else {
      alert('Review cannot be blank.');
    }
  };

  const handleSubmitLong = () => {
    if (canSubmitLong(content)) {
      if (
        confirm(
          'Are you sure you want to publish this review? This action cannot be undone.',
        )
      ) {
        postLongReview({
          preprint: preprint.uuid,
          contents: content,
          isPublished: true,
          authors:
            review && review.authors
              ? review.authors.reduce((authors, author) => {
                  if (author.uuid) {
                    authors.push({ uuid: author.uuid });
                  }
                  return authors;
                }, [])
              : null,
        })
          .then(() => {
            setActiveStep(prevActiveStep => prevActiveStep + 2);

            setSkipped(prevSkipped => {
              const newSkipped = new Set(prevSkipped.values());
              newSkipped.add(activeStep);
              return newSkipped;
            });

            setDisabledSubmit(true);
            handleComplete(activeStep + 1);
            if (
              Object.keys(answerMap).length === 0 &&
              answerMap.constructor === Object
            ) {
              return onClose(false, content);
            } else {
              return onClose(answerMap, content);
            }
          })
          .catch(err => alert(`An error occurred: ${err.message}`));
      }
    }
  };

  const totalSteps = () => {
    return getSteps().length;
  };

  const isStepOptional = step => {
    return step === 1;
  };

  const isStepSkipped = step => {
    return skipped.has(step);
  };

  const skippedSteps = () => {
    return skipped.size;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!hasRapidReviewed && !handleSubmitRapid()) {
        return false;
      } else {
        setExpandFeedback(expandFeedback => !expandFeedback);
        handleComplete();
      }
    } else if (activeStep === 1) {
      if (!handleSubmitLong()) {
        return false;
      }
    }

    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleComplete = step => {
    const newCompleted = new Set(completed);
    newCompleted.add(activeStep);

    if (step === 2) {
      newCompleted.add(activeStep + step);
      setActiveStep(step);
    } else if (step === 4) {
      newCompleted.add(activeStep + 1);
      newCompleted.add(activeStep + 2);
    }

    setCompleted(newCompleted);

    /**
     * Sigh... it would be much nicer to replace the following if conditional with
     * `if (!this.allStepsComplete())` however state is not set when we do this,
     * thus we have to resort to not being very DRY.
     */
    if (completed.size !== totalSteps() - skippedSteps()) {
      // handleNext(activeStep);
    }
  };

  function isStepComplete(step) {
    return completed.has(step);
  }

  function getSteps() {
    return ['Rapid Review', 'Long-form Review', 'Submitted'];
  }

  useEffect(() => {
    if (hasRapidReviewed) {
      handleComplete();
    }

    if (hasLongReviewed) {
      setActiveStep(2);
      handleComplete(4);
    }
  }, [
    hasRapidReviewed,
    hasLongReviewed,
    loading,
    reviewId,
    templates,
    template,
  ]);

  function getStepContent(step) {
    switch (step) {
      case 0:
        return hasRapidReviewed || expandFeedback ? (
          <>
            <Box textAlign="right">
              <Button
                disabled
                variant="contained"
                color="primary"
                className={classes.button}
              >
                <Check />
                Submit
              </Button>
            </Box>
            <Box mt={2} mb={2} className={classes.yellow}>
              Congratulations! You have successfully submitted your rapid
              review. Would you like to expand on your feedback with a long-form
              review?
            </Box>
          </>
        ) : (
          <Box>
            <Tooltip
              title={`A Rapid Review is a structured form with Yes/No/N.A./Not Sure answer options 
              designed for researchers with subject matter expertise to provide quick and accurate feedback to a preprint. 
              You'll be able to provide a longer, more in-depth review after you complete this rapid-review form.`}
            >
              <header className="shell-content-reviews__title">
                Rapid Review <HelpOutlineIcon />
              </header>
            </Tooltip>
            <form>
              <RapidFormFragment
                answerMap={answerMap}
                onChange={(key, value) => {
                  setAnswerMap(answerMap => ({
                    ...answerMap,
                    [key]: value,
                  }));
                }}
              />
              <InputLabel
                htmlFor="competing-interest"
                className={classes.inputLabel}
              >
                Please use the space below to declare any existing{' '}
                <Link
                  href="https://content.prereview.org/coc/#toc-anchor_5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Competing Interest
                </Link>
                .
              </InputLabel>
              <Input
                className={classes.input}
                id="competing-interest"
                multiline
                rows={2}
                disableUnderline
              />
              <Box mt={2} mb={2} className={classes.yellow}>
                Please review the{' '}
                <Link
                  href="https://content.prereview.org/coc/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PREreview Code of Conduct
                </Link>{' '}
                before submitting your review.
              </Box>
            </form>
          </Box>
        );
      case 1:
        return (
          <Box mt={2}>
            <Tooltip
              title={`A Longform Review is a space designed for researchers with subject matter expertise to provide longer, 
              and more in-depth feedback to a preprint. It can be authored by one or more users. 
              To add a co-reviewer, save your draft and click on + Add Co-Reviewer. 
              To invite someone to edit your review before submitting, save your draft and click on + Add Mentor. 
              When submitted, the Longform Review is assigned a digital object identifier (DOI) via Zenodo.`}
            >
              <header className="shell-content-reviews__title">
                Longform Review <HelpOutlineIcon />
              </header>
            </Tooltip>
            <Box className={classes.red}>
              <Typography
                component="div"
                variant="body1"
                display="block"
                gutterBottom
              >
                <b>Instructions</b>
              </Typography>
              <Typography component="div" variant="body1" gutterBottom>
                Use the space below to compose your long-form review. For
                guidance, you can load one of our templates.
              </Typography>
              <Typography component="div" variant="body1" gutterBottom>
                Please remember to be constructive and to abide by the{' '}
                <Link
                  href="https://content.prereview.org/coc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes.redLink}
                >
                  PREreview Code of Conduct
                </Link>
                .
              </Typography>
            </Box>
            <Box mt={2} mb={2}>
              <Grid
                container
                justify="space-between"
                alignItems="flex-end"
                spacing={2}
              >
                <Grid item xs={12} sm={6}>
                  <AddAuthors
                    reviewId={cid}
                    authors={review ? review.authors : null}
                  />
                  <AddAuthors
                    isMentor={true}
                    reviewId={cid}
                    authors={review ? review.mentors : null}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box textAlign="right" mr={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="button"
                      onClick={handleOpen}
                    >
                      Load templates
                    </Button>
                    <Modal
                      open={open}
                      onClose={handleClose}
                      aria-label="template picker modal"
                    >
                      <div className={classes.modal}>
                        <InputLabel id="templates-select-label">
                          Choose a template to paste into the editor
                        </InputLabel>
                        <Select
                          className={classes.select}
                          labelId="templates-select-label"
                          id="templates-select"
                          value={template}
                          onChange={event =>
                            handleTemplateChange(event.target.value)
                          }
                        >
                          {templates
                            ? templates.data.map(template => (
                                <MenuItem
                                  key={template.uuid}
                                  value={template.contents}
                                  className={classes.template}
                                >
                                  {template.title}
                                </MenuItem>
                              ))
                            : null}
                        </Select>
                        {template ? (
                          <Box my={2}>
                            <Paper elevation={3} className={classes.paper}>
                              {ReactHtmlParser(template, options)}
                            </Paper>
                          </Box>
                        ) : null}
                        <Box mt={2}>
                          <Grid container spacing={2} justify="flex-end">
                            <Grid item>
                              <Button
                                variant="outlined"
                                color="primary"
                                type="button"
                                onClick={handleClose}
                              >
                                Close
                              </Button>
                            </Grid>
                            <Grid item>
                              <Button
                                variant="contained"
                                color="primary"
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(template);
                                  handleCopied();
                                }}
                              >
                                Copy
                              </Button>
                              <Snackbar
                                open={openCopied}
                                autoHideDuration={6000}
                                onClose={handleCloseCopied}
                              >
                                <Alert
                                  onClose={handleCloseCopied}
                                  severity="success"
                                >
                                  Template copied
                                </Alert>
                              </Snackbar>
                            </Grid>
                          </Grid>
                        </Box>
                      </div>
                    </Modal>
                  </Box>
                </Grid>
              </Grid>
              <form>
                <Box m={2}>
                  <LongFormFragment
                    onContentChange={onContentChange}
                    content={content}
                    template={template}
                    reviewId={cid}
                  />
                </Box>
                <Box mt={2}>
                  <InputLabel
                    htmlFor="competing-interest"
                    className={classes.inputLabel}
                  >
                    Please use the space below to declare any existing{' '}
                    <Link href="#">Competing Interest</Link>.
                  </InputLabel>
                  <Input
                    className={classes.input}
                    id="competing-interest"
                    multiline
                    rows={2}
                    disableUnderline
                  />
                </Box>
              </form>
            </Box>
            <Box textAlign="right">
              <Button
                disabled={disabledSubmit}
                variant="outlined"
                color="primary"
                onClick={handleSaveLong}
                className={classes.button}
              >
                Save
              </Button>
              <Button
                disabled={disabledSubmit}
                variant="contained"
                color="primary"
                onClick={handleSubmitLong}
                className={classes.button}
              >
                Submit
              </Button>
              <Modal open={loading}>
                <div className={classes.loading}>
                  <CircularProgress />
                </div>
              </Modal>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box mt={2} mb={2} className={classes.yellow}>
            Congratulations! You have successfully submitted your PREreview.
          </Box>
        );
      default:
        return 'Unknown step';
    }
  }

  return (
    <ThemeProvider theme={prereviewTheme}>
      <div className={classes.root}>
        <Stepper
          alternativeLabel
          nonLinear
          activeStep={activeStep}
          connector={<QontoConnector />}
        >
          {steps.map((label, index) => {
            const stepProps = {};
            const buttonProps = {};
            if (isStepOptional(index)) {
              buttonProps.optional = (
                <Typography component="div" variant="caption">
                  Optional
                </Typography>
              );
            }
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step key={label} {...stepProps}>
                <StepLabel
                  className={classes.label}
                  StepIconComponent={QontoStepIcon}
                  completed={isStepComplete(index)}
                  {...buttonProps}
                >
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <div>
          {activeStep === steps.length ? (
            <Box mt={2} mb={2} className={classes.yellow}>
              Congratulations! You have successfully submitted your PREreview.
            </Box>
          ) : (
            <div>
              {getStepContent(activeStep)}
              <Box textAlign="right">
                {activeStep === 0 ? (
                  <>
                    {hasRapidReviewed && (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleComplete(2)}
                        className={classes.button}
                      >
                        No
                      </Button>
                    )}

                    {!hasLongReviewed ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        className={classes.button}
                      >
                        {!hasRapidReviewed && activeStep === 0
                          ? 'Submit'
                          : 'Yes'}
                      </Button>
                    ) : null}
                  </>
                ) : null}
              </Box>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

ReviewStepper.propTypes = {
  preprint: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onContentChange: PropTypes.func.isRequired,
  onReviewChange: PropTypes.func.isRequired,
  hasLongReviewed: PropTypes.bool.isRequired,
  hasRapidReviewed: PropTypes.bool.isRequired,
  content: PropTypes.string,
  review: PropTypes.object,
};
