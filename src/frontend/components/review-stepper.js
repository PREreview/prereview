// base imports
import React, { useState, useEffect } from 'react';
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
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
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
} from '../hooks/api-hooks.tsx';

// components
import Controls from './controls';
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
      fontSize: '0.8rem',
    },
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  label: {
    textAlign: 'center',
  },
  yellow: {
    backgroundColor: '#FFFAEE',
    padding: 10,
  }
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

export default function ReviewStepper({ user, preprint, disabled, onClose }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [answerMap, setAnswerMap] = useState({});
  const [completed, setCompleted] = React.useState(new Set());
  const [checkedCOI, setCheckedCOI] = React.useState(false);
  const [content, setContent] = useState('');
  const [expandConsent, setExpandConsent] = React.useState(false);
  const [expandFeedback, setExpandFeedback] = React.useState(false);
  const [expandLong, setExpandLong] = React.useState(false);
  const [disabledRapid, setDisabledRapid] = React.useState(false);
  const [disabledSkip, setDisabledSkip] = React.useState(false);
  const [disabledSubmit, setDisabledSubmit] = React.useState(false);
  const [initialContent, setInitialContent] = useState('');
  const [skipped, setSkipped] = React.useState(new Set());
  const [submitted, setSubmitted] = React.useState(false);
  const steps = getSteps();

  const onContentChange = value => {
    setContent(value);
  };

  const handleCOIChange = event => {
    setCheckedCOI(event.target.checked);
  };

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

  const handleSubmitRapid = () => {
    if (!checkedCOI) {
      window.prompt('Please tell us about your conflict of interest');
    }
    setActiveStep(prevActiveStep => prevActiveStep + 2);

    setSkipped(prevSkipped => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });

    setDisabledSubmit(true);
    setSubmitted(true);
    handleComplete();
  };

  const handleSaveLong = () => {
    console.log('saved!');
  };

  const handleSubmitBoth = () => {
    console.log('submitted!');
    setDisabledSubmit(true);
    setSubmitted(true);
    handleComplete(activeStep + 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep + 1)) {
      // You probably want to guard against something like this
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }
    setDisabledSkip(true);
    setExpandConsent(true);
  };

  const skippedSteps = () => {
    return skipped.size;
  };

  const handleNext = step => {
    const newActiveStep = step ? activeStep + 1 : activeStep + 2;
    setActiveStep(newActiveStep);
  };

  const handleNextRapid = () => {
    setExpandFeedback(true);
    setDisabledRapid(true);
  };

  const handleNextLong = () => {
    setDisabledSkip(true);
    setExpandLong(true);
    handleComplete(activeStep + 1);
  };

  const handleComplete = step => {
    const newCompleted = new Set(completed);
    newCompleted.add(activeStep);

    if (!step) {
      newCompleted.add(activeStep + 2);
    } else if (step === 2) {
      newCompleted.add(activeStep + 1);
    }

    setCompleted(newCompleted);

    /**
     * Sigh... it would be much nicer to replace the following if conditional with
     * `if (!this.allStepsComplete())` however state is not set when we do this,
     * thus we have to resort to not being very DRY.
     */
    if (completed.size !== totalSteps() - skippedSteps()) {
      handleNext(step);
    }
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
          {submitted ? (
            <Box mt={2} mb={2} className={classes.yellow}>
              Congratulations! You have successfully submitted your PREreview.
            </Box>
          ) : (
            <Box>
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
              </form>
              <Box textAlign="right">
                <Button
                  disabled={disabledRapid}
                  variant="contained"
                  color="primary"
                  onClick={handleNextRapid}
                  className={classes.button}
                >
                  Next
                </Button>
              </Box>
              {expandFeedback ? (
                <Box>
                  <Box mt={2} mb={2}>
                    Would you like to expand on your feedback with a longform review?
                  </Box>
                  <Box textAlign="right">
                    <Button
                      disabled={disabledSkip}
                      variant="outlined"
                      color="primary"
                      onClick={handleSkip}
                      className={classes.button}
                    >
                      Skip
                    </Button>
                    <Button
                      disabled={disabledSkip}
                      variant="contained"
                      color="primary"
                      onClick={handleNextLong}
                      className={classes.button}
                    >
                      Yes
                    </Button>
                  </Box>
                </Box>
              ) : null}
              {expandConsent ? (
                <Box>
                  <Box mt={2} mb={2} className={classes.yellow}>
                    Thank you for your contribution!
                    <br />
                    Please review <Link href="#">
                      PREreview Code of Conduct
                    </Link>{' '}
                     before submitting your review.
                  </Box>
                  <FormControlLabel
                    className={classes.formLabel}
                    control={
                      <Checkbox
                        checked={checkedCOI}
                        onChange={handleCOIChange}
                        name="checkedCOI"
                        color="primary"
                      />
                    }
                    label="I have no conflict of interest in reviewing this preprint."
                  />
                  <Box textAlign="right">
                    <Button
                      disabled={disabledSubmit}
                      variant="contained"
                      color="primary"
                      onClick={handleSubmitRapid}
                      className={classes.button}
                    >
                      Submit
                    </Button>
                  </Box>
                </Box>
              ) : null}
              {expandLong ? (
                <Box>
                  <Box mt={2} mb={2}>
                    <form>
                    <LongFormFragment
                      onContentChange={onContentChange}
                      content={initialContent}
                    />
                    </form>
                  </Box>
                  <Box>
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
                      onClick={handleSubmitBoth}
                      className={classes.button}
                    >
                      Submit
                    </Button>
                  </Box>
                </Box>
              ) : null}
            </Box>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

ReviewStepper.propTypes = {
  user: PropTypes.object,
  preprint: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
}
