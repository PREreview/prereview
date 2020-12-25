// base imports
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

// material ui
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Check from '@material-ui/icons/Check';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import StepConnector from '@material-ui/core/StepConnector';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';

// utils
import {
  usePostFullReviews,
  usePostRapidReviews,
} from '../hooks/api-hooks.tsx';

// components
import Controls from './controls';
import RapidFormFragment from './rapid-form-fragment';
import LongFormFragment from './long-form-fragment';

// constants
import { QUESTIONS } from '../constants';

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
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
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
    }
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

export default function ReviewStepper({ user, preprint, disabled, onClose }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState(new Set());
  const [skipped, setSkipped] = React.useState(new Set());
  const steps = getSteps();

  const canSubmitRapid = answerMap => {
    return QUESTIONS.filter(q => q.type == 'YesNoQuestion').every(
      question => question.identifier in answerMap,
    );
  };

  const canSubmitFull = content => {
    return content && content !== '<p></p>';
  };

  const totalSteps = () => {
    return getSteps().length;
  };

  const isStepOptional = step => {
    return step === 1;
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1);
    setSkipped(prevSkipped => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const skippedSteps = () => {
    return skipped.size;
  };

  const completedSteps = () => {
    return completed.size;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps() - skippedSteps();
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed
          // find the first step that has been completed
          steps.findIndex((step, i) => !completed.has(i))
        : activeStep + 1;

    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleStep = step => () => {
    setActiveStep(step);
  };

  const handleComplete = () => {
    const newCompleted = new Set(completed);
    newCompleted.add(activeStep);
    setCompleted(newCompleted);

    /**
     * Sigh... it would be much nicer to replace the following if conditional with
     * `if (!this.allStepsComplete())` however state is not set when we do this,
     * thus we have to resort to not being very DRY.
     */
    if (completed.size !== totalSteps() - skippedSteps()) {
      handleNext();
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted(new Set());
    setSkipped(new Set());
  };

  const isStepSkipped = step => {
    return skipped.has(step);
  };

  function isStepComplete(step) {
    return completed.has(step);
  }

  function getSteps() {
    return ['Rapid Review', 'Longform Review', 'Submitted'];
  }

  function getStepContent(step) {
    const { mutate: postRapidReview, loading, error } = usePostRapidReviews();

    const {
      mutate: postLongReview,
      loadingPostLongReview,
    } = usePostFullReviews();

    const [hasRapidReviewed, setHasRapidReviewed] = useState(false);
    const [hasLongReviewed, setHasLongReviewed] = useState(false);

    const [answerMap, setAnswerMap] = useState({});

    const [initialContent, setInitialContent] = useState('');
    const [content, setContent] = useState('');

    const onContentChange = value => {
      setContent(value);
    };

    useEffect(() => {
      if (user) {
        preprint.fullReviews.map(review => {
          review.authors.map(author => {
            user.personas.some(persona => {
              if (persona.identity === author.identity) {
                if (review.published === true) {
                  setHasLongReviewed(true);
                } else {
                  setInitialContent(
                    review.drafts[review.drafts.length - 1].contents,
                  );
                }
              }
            });
          });
        });

        preprint.rapidReviews.map(review => {
          user.personas.some(persona => {
            if (persona.identity === review.author.identity) {
              setHasRapidReviewed(true);
            }
          });
        });
      }
    }, [preprint, user]);

    switch (step) {
      case 0:
        return (
          <div>
            <header className="shell-content-reviews__title">
              Rapid Review
            </header>
            <form>
              <RapidFormFragment
                answerMap={answerMap}
                onChange={(key, value) => {
                  setAnswerMap(answerMap => ({ ...answerMap, [key]: value }));
                }}
              />
              <Controls error={error}>
                <Button
                  type="submit"
                  primary={true}
                  isWaiting={loading}
                  disabled={disabled || !canSubmitRapid}
                  onClick={event => {
                    event.preventDefault();
                    if (canSubmitRapid(answerMap)) {
                      postRapidReview({ ...answerMap, preprint: preprint.id })
                        .then(() => {
                          alert('Rapid review submitted successfully.');
                          return onClose(answerMap);
                        })
                        .catch(err =>
                          alert(`An error occurred: ${err.message}`),
                        );
                    } else {
                      alert(
                        'Please complete the required fields. All multiple choice questions are required.',
                      );
                    }
                  }}
                >
                  Submit
                </Button>
              </Controls>
            </form>
          </div>
        );
      case 1:
        return (
          <form>
            <LongFormFragment
              onContentChange={onContentChange}
              content={initialContent}
            />

            <Controls error={error}>
              <Button
                type="submit"
                primary={true}
                isWaiting={loadingPostLongReview}
                disabled={disabled || !canSubmitFull(content)}
                onClick={event => {
                  event.preventDefault();
                  if (canSubmitFull(content)) {
                    postLongReview({
                      preprint: preprint.id,
                      contents: content,
                    })
                      .then(() => alert('Draft updated successfully.'))
                      .catch(err => alert(`An error occurred: ${err.message}`));
                  } else {
                    alert('Review cannot be blank.');
                  }
                }}
              >
                Save
              </Button>
              <Button
                type="submit"
                primary={true}
                isWaiting={loadingPostLongReview}
                disabled={disabled || !canSubmitFull(content)}
                onClick={event => {
                  event.preventDefault();
                  if (canSubmitFull(content)) {
                    if (
                      confirm(
                        'Are you sure you want to publish this review? This action cannot be undone.',
                      )
                    ) {
                      postLongReview({
                        preprint: preprint.id,
                        contents: content,
                        published: true,
                      })
                        .then(() => {
                          alert('Full review submitted successfully.');
                          return onClose(content);
                        })
                        .catch(err =>
                          alert(`An error occurred: ${err.message}`),
                        );
                    }
                  } else {
                    alert('Review cannot be blank.');
                  }
                }}
              >
                Submit
              </Button>
            </Controls>
          </form>
        );
      case 2:
        return (
          <div>
            Congratulations! You have successfully submitted your PREreview.
          </div>
        );
      default:
        return 'Unknown step';
    }
  }

  return (
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
        {allStepsCompleted() ? (
          <div>
            <Typography className={classes.instructions}>
              All steps completed - you&apos;re finished
            </Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <div>
            {getStepContent(activeStep)}
            <div>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className={classes.button}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                className={classes.button}
              >
                Next
              </Button>
              {isStepOptional(activeStep) && !completed.has(activeStep) && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSkip}
                  className={classes.button}
                >
                  Skip
                </Button>
              )}

              {activeStep !== steps.length &&
                (completed.has(activeStep) ? (
                  <Typography variant="caption" className={classes.completed}>
                    Step {activeStep + 1} already completed
                  </Typography>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleComplete}
                  >
                    {completedSteps() === totalSteps() - 1
                      ? 'Finish'
                      : 'Complete Step'}
                  </Button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ReviewStepper.propTypes = {
  user: PropTypes.object,
  preprint: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
}
