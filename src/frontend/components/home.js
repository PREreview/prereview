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
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

// components
import HeaderBar from './header-bar';
import SearchBar from './search-bar';
import WelcomeModal from './welcome-modal';

// constants
import { ORG } from '../constants';

const useStyles = makeStyles(theme => ({
  buttonLink: {
    background: theme.palette.primary.main,
    borderRadius: '20px',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    color: '#fff !important',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    padding: '20px',
    position: 'relative',
    '&:hover': {
      textDecoration: 'underline',
      '&:after': {
        border: '3px solid #fff',
        borderRadius: '20px',
        content: '" "',
        height: '70%',
        left: '50%',
        position: 'absolute',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '95%',
      },
    },
  },
  hero: {
    padding: '1rem',
  },
  home: {},
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
  const [search, setSearch] = useState(params.get('search') || '');
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

      <Container className={classes.hero}>
        <Typography variant="h4" component="div" gutterBottom>
          Catalyzing change in peer review through equity, openness, and
          collaboration
        </Typography>
        <Typography variant="h5" component="div">
          We envision a world in which feedback to scholarly outputs is done
          openly, rapidly, constructively, and by a global community of peers.
        </Typography>
        <Box my={6}>
          <Link href="/login" className={classes.buttonLink}>
            Join us and start reviewing now
          </Link>
        </Box>
      </Container>
      <Box bgcolor="#D2D1CE" py={4}>
        <Container>
          <Typography variant="h5" component="div">
            Search and browse preprint reviews
          </Typography>
          <div className="">
            <SearchBar
              onChange={value => {
                params.delete('page');
                setSearch(value);
              }}
              onCancelSearch={() => {
                params.delete('search');
                setSearch('');
                history.push({
                  pathname: '/search', //#FIXME pagename?
                  search: params.toString(),
                });
              }}
              onRequestSearch={() => {
                params.set('search', search);
                params.delete('page');
                history.push({
                  pathname: '/search', //#FIXME pagename?
                  search: params.toString(),
                });
              }}
            />
          </div>
        </Container>
      </Box>
    </Box>
  );
}
