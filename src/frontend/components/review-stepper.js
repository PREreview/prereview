// base imports
import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';

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
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Link from '@material-ui/core/Link';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepConnector from '@material-ui/core/StepConnector';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';

// utils
import {
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
  formLabel: {
    '& span:last-child': {
      fontSize: '0.9rem',
    },
  },
  fullWidth: {
    padding: 5,
    width: '100%',
  },
  input: {
    border: '1px solid #ccc',
    margin: 15,
    width: '98%',
  },
  inputLabel: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: '0.9rem',
    margin: '0 15px',
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  label: {
    textAlign: 'center',
  },
  red: {
    backgroundColor: '#FAB7B7',
    margin: '0 15px',
    padding: 10,
  },
  yellow: {
    backgroundColor: '#FFFAEE',
    fontSize: '0.9rem',
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
  const [activeStep, setActiveStep] = useState(0);
  const [answerMap, setAnswerMap] = useState({});
  const [completed, setCompleted] = useState(new Set());
  const [expandFeedback, setExpandFeedback] = useState(false);
  const [disabledSubmit, setDisabledSubmit] = useState(false);
  const [reviewId, setReviewId] = useState(review ? review.parent : null);
  const [skipped, setSkipped] = useState(new Set());
  const steps = getSteps();

  const { mutate: postRapidReview } = usePostRapidReviews();
  const { mutate: postLongReview } = usePostFullReviews();
  const { mutate: putLongReview } = usePutFullReview({ id: reviewId });

  const canSubmitRapid = answerMap => {
    return QUESTIONS.filter(q => q.type == 'YesNoQuestion').every(
      question => question.identifier in answerMap,
    );
  };

  const canSubmitLong = content => {
    return content && content !== '<p></p>';
  };

  const handleSubmitRapid = () => {
    if (!hasRapidReviewed) {
      if (canSubmitRapid(answerMap)) {
        postRapidReview({ ...answerMap, preprint: preprint.id })
          .then(response => {
            return onClose(answerMap);
          })
          .catch(err => {
            alert(`An error occurred: ${err.message}`);
            return false;
          });
      } else {
        alert(
          'Please complete the required fields. All multiple choice questions are required.',
        );
        return false;
      }
      return;
    }
  };

  const handleSaveLong = event => {
    event.preventDefault();
    if (canSubmitLong(content)) {
      if (reviewId) {
        putLongReview({
          contents: content,
        })
          .then(() => alert('Draft updated successfully.'))
          .catch(err => alert(`An error occurred: ${err.message}`));
      } else {
        postLongReview({
          preprint: preprint.id,
          contents: content,
        })
          .then(response => {
            alert('Draft updated successfully.');
            setReviewId(response.body.id);
            onReviewChange(response.body);
            return history.push(`${location.pathname}/${response.body.id}`);
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
          preprint: preprint.id,
          contents: content,
          isPublished: true,
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

  // useEffect(() => {
  //   if (reviewId) {
  //     history.push(`${location.pathname}/${reviewId}`);
  //   }
  // }, []);

  useEffect(() => {
    if (hasRapidReviewed) {
      handleComplete();
    }

    if (hasLongReviewed) {
      setActiveStep(2);
      handleComplete(4);
    }
  }, [hasRapidReviewed, hasLongReviewed, reviewId]);

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
            <header className="shell-content-reviews__title">
              Rapid Review
            </header>
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
                <Link href="#">Competing Interest</Link>.
              </InputLabel>
              <Input
                className={classes.input}
                id="competing-interest"
                multiline
                rows={2}
                disableUnderline
              />
              <Box mt={2} mb={2} className={classes.yellow}>
                Thank you for your contribution!
                <br />
                Please review the{' '}
                <Link href="#">PREreview Code of Conduct</Link> before
                submitting your review.
              </Box>
            </form>
          </Box>
        );
      case 1:
        return (
          <Box mt={2}>
            <Box className={classes.red}>
              <Typography variant="button" display="block" gutterBottom>
                Instructions
              </Typography>
              <Typography variant="body2" gutterBottom>
                Use the space below to compose your long-form review. For
                guidance, you can load one of our templates.
              </Typography>
              <Typography variant="body2" gutterBottom>
                Please remember to be constructive and to abide by the{' '}
                <Link href="#">PREreview Code of Conduct</Link>.
              </Typography>
            </Box>
            <Box mt={2} mb={2}>
              <AddAuthors reviewId={review ? review.id : null} />
              <AddAuthors
                isMentor={true}
                reviewId={review ? review.id : null}
              />
              <form>
                <Box m={2}>
                  <LongFormFragment
                    onContentChange={onContentChange}
                    content={content}
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
                <Typography variant="caption">Optional</Typography>
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
