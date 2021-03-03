// base imports
import React, { useContext, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// hooks
import {
  useIsNewVisitor,
  useIsMobile,
  useNewPreprints,
} from '../hooks/ui-hooks';

// utils
import { processParams, searchParamsToObject } from '../utils/search';

// contexts
import UserProvider from '../contexts/user-context';

// Material UI
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

// components
import HeaderBar from './header-bar';
import WelcomeModal from './welcome-modal';

// constants
import { ORG } from '../constants';

const useStyles = makeStyles(theme => ({
  home: {
  },
}));

export default function Home() {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const params = processParams(location.search);

  const [thisUser] = useContext(UserProvider.context);
  const isMobile = useIsMobile();
  const isNewVisitor = useIsNewVisitor();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile);

  return (
    <Box className={classes.home}>
      <Helmet>
        <title>Home • {ORG}</title>
      </Helmet>

      {!!((isNewVisitor || params.get('welcome')) && isWelcomeModalOpen) && (
        <WelcomeModal
          onClose={() => {
            setIsWelcomeModalOpen(false);
          }}
        />
      )}
      <HeaderBar
        thisUser={thisUser}
        onClickMenuButton={() => {
          setShowLeftPanel(!showLeftPanel);
        }}
      />

      <Container>
        <Typography variant="h1" component="div">
          Catalyzing change in peer review through equity, openness, and
          collaboration
        </Typography>
      </Container>
    </Box>
  );
}
