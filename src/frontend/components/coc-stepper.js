// base imports
import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// material ui
import {
  ThemeProvider,
  createMuiTheme,
  makeStyles,
  withStyles,
} from '@material-ui/core/styles';
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
  return ['Welcome to PREreview.org!', 'Code of conduct', 'Openness', 'Log in and data sharing'];
}

export default function CoCStepper({openNext}){
  const steps = getSteps()
  const classes = useStyles()

  const [activeStep, setActiveStep] = React.useState(0);


  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      openNext()
    }
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
                By making an account on this platform, you effectively enter the PREreview 
                community and will be able to review preprints, request reviews of preprints, 
                as well as comment on, endorse, and report other community members’ reviews.
                Please read the following information carefully to fully understand 
                the implications of becoming a member of our community.`;
      case 1:
        return (<Fragment>

                  <List>
                    <ListItem>
                      <ListItemText primary={`In the interest of fostering an open and welcoming environment we, as PREreview's leaders, contributors, and maintainers, pledge to make participation in our project and our  community a harassment-free experience for everyone, regardless of background, family status, gender, gender identity or expression, marital status, sex, sexual orientation, native language, age, ability, race/ethnicity, caste, national origin, socioeconomic status, religion, geographic location, and any other dimension of diversity. `}/>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`You, as a member of our community, are expected to abide by PREreview Code of Conduct. In short, you are expected to: `}/>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ArrowRightAltIcon />
                      </ListItemIcon>
                      <ListItemText primary='Use welcoming and inclusive language'></ListItemText>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ArrowRightAltIcon />
                      </ListItemIcon>                   
                      <ListItemText primary='Providing feedback that is constructive, i.e., useful to the receiver'></ListItemText>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ArrowRightAltIcon />
                      </ListItemIcon>   
                      <ListItemText primary='Be respectful of differing viewpoints and experiences'></ListItemText>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ArrowRightAltIcon />
                      </ListItemIcon>   
                      <ListItemText primary='Gracefully accept constructive criticism'></ListItemText>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ArrowRightAltIcon />
                      </ListItemIcon>   
                      <ListItemText primary='Focus on what is best for the community'></ListItemText>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ArrowRightAltIcon />
                      </ListItemIcon>   
                      <ListItemText primary='Show empathy towards other community members'></ListItemText>
                    </ListItem>
                  </List>
                </Fragment>);
      case 2:
        return (
                <List>
                  <ListItem>
                    <ListItemText primary='PREreview operates as a non-for-profit organization via the fiscal sponsorship of Code for Science and Society.'/> 
                  </ListItem>
                  <ListItem>
                    <ListItemText primary='This platform is funded by public grants and private donations.'/>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary='The code that runs this platform is open-source and can be found on our GitHub repository under the MIT licence.' />
                  </ListItem>
                </List>
        )
      case 3:
        return ( <List>
                    <ListItem>
                      <ListItemIcon>
                        <ArrowRightAltIcon />
                      </ListItemIcon>
                      <ListItemText primary='Our login is via the ORCID public API. If you
                      do not already have an account with ORCID, to sign up on PREreview you will need to make one. Register here.' />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ArrowRightAltIcon />
                      </ListItemIcon>
                      <ListItemText primary='The reviews published on this platform will be licensed CC-BY 4.0 and be openly available to everyone. However, you will be able to set your account to anonymous or public. '/>
                    </ListItem>
                   <ListItem>
                      <ListItemIcon>
                        <ArrowRightAltIcon />
                      </ListItemIcon>
                      <ListItemText primary='We DO NOT share your data with advertisers, social media companies, or analytics partners. However, the reviews, comments, and endorsements via Plaudit.pub can be downloaded openly for meta-analysis purposes, stripped of any personal information. Learn more.`'/>
                    </ListItem>  
                </List>
                )
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
                      Next
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