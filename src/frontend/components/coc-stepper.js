// base imports
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

// material ui
import { makeStyles } from '@material-ui/core/styles';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
}));

const getSteps = () => {
  return [
    'Welcome to PREreview.org!',
    'Code of conduct',
    'Openness',
    'Log in and data sharing',
  ];
};

export default function CoCStepper({ openNext }) {
  const steps = getSteps();
  const classes = useStyles();

  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      openNext();
    }
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <List>
            <ListItem>
              <ListItemText
                primary={`PREreview.org is a platform for the crowdsourcing of preprint reviews.
                By making an account on this platform, you effectively enter the PREreview
                community and will be able to review preprints, request reviews of preprints,
                as well as comment on, endorse, and report other community members’ reviews.`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={`Please read the following information carefully to fully understand the implications of becoming a member of our community.`}
              />
            </ListItem>
          </List>
        );
      case 1:
        return (
          <Fragment>
            <List>
              <ListItem>
                <ListItemText>
                  In the interest of fostering an open and welcoming environment
                  we, as PREreview&apos;s leaders, contributors, and
                  maintainers, pledge to make participation in our project and
                  our community a harassment-free experience for everyone,
                  regardless of background, family status, gender, gender
                  identity or expression, marital status, sex, sexual
                  orientation, native language, age, ability, race/ethnicity,
                  caste, national origin, socioeconomic status, religion,
                  geographic location, and any other dimension of diversity.
                </ListItemText>
              </ListItem>
              <ListItemText>
                You, as a member of our community, are expected to abide by{' '}
                <a
                  href="https://content.prereview.org/coc"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PREreview Code of Conduct
                </a>
                . In short, you are expected to:
              </ListItemText>
              <ListItem>
                <ListItemIcon>
                  <ArrowRightAltIcon />
                </ListItemIcon>
                <ListItemText primary="Use welcoming and inclusive language" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ArrowRightAltIcon />
                </ListItemIcon>
                <ListItemText primary="Provide constructive feedback" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ArrowRightAltIcon />
                </ListItemIcon>
                <ListItemText primary="Be respectful of differing viewpoints and experiences" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ArrowRightAltIcon />
                </ListItemIcon>
                <ListItemText primary="Gracefully accept constructive criticism" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ArrowRightAltIcon />
                </ListItemIcon>
                <ListItemText primary="Focus on what is best for the community" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ArrowRightAltIcon />
                </ListItemIcon>
                <ListItemText primary="Show empathy towards other community members" />
              </ListItem>
            </List>
          </Fragment>
        );
      case 2:
        return (
          <Fragment>
            <List>
              <ListItem>
                <ListItemText>
                  PREreview operates as a non-for-profit organization via the
                  fiscal sponsorship of{' '}
                  <a
                    href="https://codeforscience.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {' '}
                    Code for Science and Society
                  </a>
                  .
                </ListItemText>
              </ListItem>
              <ListItem>
                <ListItemText>
                  This platform is funded by public grants and private
                  donations.
                </ListItemText>
              </ListItem>
              <ListItem>
                <ListItemText>
                  The code that runs this platform is open source and can be
                  found{' '}
                  <a
                    href="https://github.com/PREreview/prereview/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    on our GitHub repository
                  </a>{' '}
                  under the MIT licence.
                </ListItemText>
              </ListItem>
            </List>
          </Fragment>
        );
      case 3:
        return (
          <List>
            <ListItem>
              <ListItemText>
                Our login is via{' '}
                <a
                  href="https://info.orcid.org/documentation/features/public-api/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ORCID's public API
                </a>
                . If you do not already have an account with ORCID, to sign up
                on PREreview you will need to make one.{' '}
                <a
                  href="https://orcid.org/register"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Register here
                </a>
                .
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>
                The reviews published on this platform will be licensed
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC-BY 4.0
                </a>{' '}
                and be openly available to everyone. However, you will be able
                to set your account to anonymous or public.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>
                We DO NOT share your data with advertisers, social media
                companies, or analytics partners.
              </ListItemText>
            </ListItem>
          </List>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              <div>{getStepContent(index)}</div>
              <div className={classes.actionsContainer}>
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
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </div>
  );
}

CoCStepper.propTypes = {
  openNext: PropTypes.func,
};
