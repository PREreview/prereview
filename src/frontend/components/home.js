// base imports
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactCardFlip from 'react-card-flip';

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
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
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
  card: {
    marginBottom: '1rem',
  },
  cardTitle: {
    color: '#000 !important',
    display: 'block',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    textAlign: 'center',
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

  const [isFlipped, setIsFlipped] = useState([false, false, false]);
  const isMobile = useIsMobile();
  const isNewVisitor = useIsNewVisitor();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);
  const [search, setSearch] = useState(params.get('search') || '');
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile);

  const handleFlip = index => {
    let updatedFlipped = [...isFlipped];
    updatedFlipped[index] = !isFlipped[index];
    setIsFlipped(updatedFlipped);
  };

  useEffect(() => {}, [isFlipped]);

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
        <Box my={4}>
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
        </Box>
      </Container>
      <Box bgcolor="#D2D1CE" py={4}>
        <Container>
          <Typography variant="h5" component="div">
            Search and browse preprint reviews
          </Typography>
          <Box mt={3}>
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
          </Box>
        </Container>
      </Box>
      <Box py={4}>
        <Container>
          <Card className={classes.card}>
            {/* FIXME loop*/}
            <CardActionArea onClick={() => handleFlip(0)}>
              <ReactCardFlip isFlipped={isFlipped[0]}>
                <Box p={3}>
                  <CardContent>
                    <Link href="#FIXME" className={classes.cardTitle}>
                      Preprint Review Platform
                    </Link>
                  </CardContent>
                  <CardMedia /> {/* FIXME add asset */}
                </Box>
                <Box p={3}>
                  <Typography className={classes.cardTitle} component="div">
                    A platform for crowdsourcing of preprint reviews
                  </Typography>
                  <Typography variant="body1" component="div" gutterBottom>
                    <b>Read, request, and write</b> rapid and long-form preprint
                    reviews
                  </Typography>
                  <Typography variant="body1" component="div" gutterBottom>
                    <b>Work collaboratively</b> with your peers or find a mentor
                    who can help you write your review
                  </Typography>
                  <Typography variant="body1" component="div" gutterBottom>
                    <b>Build your profile</b> as an expert reviewer and get
                    recognized for your contributions
                  </Typography>
                </Box>
              </ReactCardFlip>
            </CardActionArea>
          </Card>
          <Card className={classes.card}>
            <CardActionArea onClick={() => handleFlip(1)}>
              <ReactCardFlip isFlipped={isFlipped[1]}>
                <Box p={3}>
                  <CardContent>
                    <Link href="#FIXME" className={classes.cardTitle}>
                      Resource Center
                    </Link>
                  </CardContent>
                  <CardMedia /> {/* FIXME add asset */}
                </Box>
                <Box p={3}>
                  <Typography className={classes.cardTitle} component="div">
                    A space to grow as a socially-conscious, constructive
                    reviewer
                  </Typography>
                  <Typography variant="body1" component="div" gutterBottom>
                    <b>Learn</b> how to provide constructive feedback
                  </Typography>
                  <Typography variant="body1" component="div" gutterBottom>
                    <b>Discover</b> your biases and how to mitigate them
                  </Typography>
                  <Typography variant="body1" component="div" gutterBottom>
                    <b>Repurpose</b> journal clubs to collaboratively discuss
                    and review preprints
                  </Typography>
                </Box>
              </ReactCardFlip>
            </CardActionArea>
          </Card>
          <Card className={classes.card}>
            <CardActionArea onClick={() => handleFlip(2)}>
              <ReactCardFlip isFlipped={isFlipped[2]}>
                <Box p={3}>
                  <CardContent>
                    <Link href="#FIXME" className={classes.cardTitle}>
                      PREreview Communities
                    </Link>
                  </CardContent>
                  <CardMedia /> {/* FIXME add asset */}
                </Box>
                <Box p={3}>
                  <Typography className={classes.cardTitle} component="div">
                    A hub for peer review communities
                  </Typography>
                  <Typography variant="body1" component="div" gutterBottom>
                    <b>Find</b> communities that are discussing research
                    relevant to you
                  </Typography>
                  <Typography variant="body1" component="div" gutterBottom>
                    <b>Join and engage</b> with a global network of peers
                  </Typography>
                  <Typography variant="body1" component="div" gutterBottom>
                    <b>Start and lead</b> your own PREreview community
                  </Typography>
                </Box>
              </ReactCardFlip>
            </CardActionArea>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
