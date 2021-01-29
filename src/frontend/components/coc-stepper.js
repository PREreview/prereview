// base imports
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// material ui
import {
  ThemeProvider,
  createMuiTheme,
  makeStyles,
  withStyles,
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
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

const getSteps = () => {
  return ['Welcome to PREreview!', 'Code of conduct', 'Openness', 'Log in and data sharing', 'Continue or not'];
}

export default function CoCStepper(){
  const steps = getSteps()
  const classes = useStyles()

  const [activeStep, setActiveStep] = React.useState(0);


  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return `PREreview.org is a platform for the crowdsourcing of preprint reviews. 
        By making an account on this platform, you effectively enter the PREreview community and will be able to review preprints, 
        request reviews preprints, as well as comment on, endorse, and report other community members’ reviews.
        Please read the following information carefully to fully understand the implications of becoming a member of our community.`;
      case 1:
        return `In the interest of fostering an open and welcoming environment we, as leadership, contributors, and maintainers, pledge to make participation in our project and our community a harassment-free experience for everyone, regardless of background, family status, gender, gender identity or expression, marital status, sex, sexual orientation, native language, age, ability, race/ethnicity, caste, national origin, socioeconomic status, religion, geographic location, and any other dimension of diversity.`;
      case 2:
        return `PREreview operates as a non-for-profit organization via the fiscal sponsorship of Code for Science and Society. Thi platform is funded by public grants and private donations. The code that runs this platform is open-source and can be found on our GitHub repository under the MIT licence.`;
      case 3:
        return `Our login is via the ORCID public API. If you do not alread have an accoun with ORCID, to sign up on PREreview you will need to make one. Register here.

        The reviews published on this platform will be licensed CC-BY 4.0 and be openly available to everyone. However, you will be able to set your account to anonymous or public. .

        We DO NOT share your data with advertisers, social media companies, or analytics partners. However, the reviews, comments, and endorcements via Plaudit.pub can be downloaded openly stripped of any personal information for mata-analysis purposes. Lern more.`
      case 4:
        return `Continue if: 
              You are okay with us connecting your ORCID public information to your PREreview account and storing it in our database.

              You are willing to share an email address with our team for the purposes of accessing notifications options and receiving occasional emails on platoform updates.

              You understand the implications of, and commit to abiding by our Code of Conduct.  
              
              Do not continue if:
              You DO NOT want to have your ORCID proflie’s public information imported to PREreview.

              You are NOT willing to abide by our Code of Conduct.

              You DO NOT wish  your reviews and comments to be shared under a CC-BY 4.0 licence.`

      default:
        return 'Unknown step';
    }
  }

  return (
    <ThemeProvider theme={prereviewTheme}>
      <div className={classes.root}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <Typography>{getStepContent(index)}</Typography>
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
                      {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </div>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </div>
    </ThemeProvider>
  );
}