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
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

// components
import HeaderBar from './header-bar';
import SearchBar from './search-bar';
import WelcomeModal from './welcome-modal';

// images
import HeroImg from '../assets/images/home/hero.svg';
import Card1 from '../assets/images/home/card-1.svg';
import Card2 from '../assets/images/home/card-2.svg';
import Card3 from '../assets/images/home/card-3.svg';

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
    [theme.breakpoints.up('md')]: {
      width: '30%',
    },
  },
  cardAction: {
    height: '100%',
  },
  cardContent: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardFront: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
  },
  cardImage: {
    display: 'block',
    maxHeight: '300px',
    maxWidth: '300px',
    paddingBottom: '50px',
    width: '100%',
  },
  cards: {
    [theme.breakpoints.up('md')]: {
      alignItems: 'stretch',
      display: 'flex',
      justifyContent: 'space-between',
    },
  },
  cardsBox: {
    background: 'linear-gradient(to bottom, #54948E 50%, #fff 50%)',
  },
  cardTitle: {
    color: '#000 !important',
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  gridTitle: {
    color: '#54948E',
    fontSize: '2rem',
  },
  gridContent: {
    fontSize: '1.5rem',
  },
  gridLink: {
    backgroundColor: '#FCBD4C',
    border: '4px solid #FCBD4C',
    borderRadius: '20px',
    color: '#000 !important',
    display: 'inline-block',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginTop: '20px',
    padding: '16px',
    '&:hover': {
      border: '4px solid #000',
    },
  },
  hero: {
    [theme.breakpoints.up('md')]: {
      backgroundImage: `url(${HeroImg})`,
      backgroundPosition: 'right bottom',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      padding: '1rem',
    },
  },
  heroContent: {
    [theme.breakpoints.up('md')]: {
      maxWidth: '70%',
    },
  },
  home: {},
  standout: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
  },
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
        <Box my={4} className={classes.heroContent}>
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
      <Box py={4} className={classes.cardsBox}>
        <Container className={classes.cards}>
          <Card className={classes.card}>
            {/* FIXME loop*/}
            <CardActionArea
              className={classes.cardAction}
              onClick={() => handleFlip(0)}
            >
              <ReactCardFlip
                className={classes.cardContent}
                isFlipped={isFlipped[0]}
                containerStyle={{ height: '100%' }}
              >
                <Box p={3} className={classes.cardFront}>
                  <CardContent>
                    <Link href="#FIXME" className={classes.cardTitle}>
                      Preprint Review Platform
                    </Link>
                  </CardContent>
                  <CardMedia>
                    <img className={classes.cardImage} src={Card1} alt="" aria-hidden="true" />
                  </CardMedia>
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
            <CardActionArea
              className={classes.cardAction}
              onClick={() => handleFlip(1)}
            >
              <ReactCardFlip
                className={classes.cardContent}
                isFlipped={isFlipped[1]}
                containerStyle={{ height: '100%' }}
              >
                <Box p={3} className={classes.cardFront}>
                  <CardContent>
                    <Link href="#FIXME" className={classes.cardTitle}>
                      Resource Center
                    </Link>
                  </CardContent>
                  <CardMedia>
                    <img className={classes.cardImage} src={Card2} alt="" aria-hidden="true" />
                  </CardMedia>
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
            <CardActionArea
              className={classes.cardAction}
              onClick={() => handleFlip(2)}
            >
              <ReactCardFlip
                className={classes.cardContent}
                isFlipped={isFlipped[2]}
                containerStyle={{ height: '100%' }}
              >
                <Box p={3} className={classes.cardFront}>
                  <CardContent>
                    <Link href="#FIXME" className={classes.cardTitle}>
                      PREreview Communities
                    </Link>
                  </CardContent>
                  <CardMedia>
                    <img className={classes.cardImage} src={Card3} alt="" aria-hidden="true" />
                  </CardMedia>
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
      <Box bgcolor="#54948E" color="#fff" p={4} textAlign="center">
        <Container>
          <Typography className={classes.standout}>
            We believe in equatable access, connecting people, self reflection,
            and measurable success.
          </Typography>
        </Container>
      </Box>
      <Box py={4} textAlign="center">
        <Container>
          <Grid container spacing={10} alignItems="center" justify="center">
            <Grid item sm={12} md={6}>
              <Typography
                component="div"
                variant="h6"
                gutterBottom
                className={classes.gridTitle}
              >
                Inviting everyone to the table
              </Typography>
              <Typography
                component="div"
                variant="body1"
                className={classes.gridContent}
                gutterBottom
              >
                On our preprint review platform, any researcher with an ORCID iD
                can request or provide constructive feedback to preprints.
              </Typography>
              <Typography
                component="div"
                variant="body1"
                className={classes.gridContent}
              >
                We are committed to providing a safe space for all voices to be
                heard without fear of retribution by enforcing a Code of
                Conduct.
              </Typography>
            </Grid>
            <Grid item sm={12} md={6}>
              <img
                src="http://satyr.io/584x253/red"
                alt=""
                aria-hidden="true"
              />
              <Typography
                component="div"
                variant="body1"
                className={classes.gridContent}
                gutterBottom
              >
                Researchers can join or start their own community to bring
                together peers with shared interests and values.
              </Typography>
              <Link href="/communities" className={classes.gridLink}>
                Explore Communities
              </Link>
            </Grid>
            <Grid item sm={12} md={6}>
              <Typography
                component="div"
                variant="h6"
                gutterBottom
                className={classes.gridTitle}
              >
                Bringing researchers together
              </Typography>
              <Typography
                component="div"
                variant="body1"
                className={classes.gridContent}
                gutterBottom
              >
                Live-streamed preprint journal clubs allow for researchers to
                engage globally and hold timely discussions around preprints.
              </Typography>
              <Typography
                component="div"
                variant="body1"
                className={classes.gridContent}
                gutterBottom
              >
                PREreview workshops and sprints facilitate conversations and
                co-creation of content across research communities to improve
                diversity and openness in peer review.
              </Typography>
              <Link href="#FIXME" className={classes.gridLink}>
                Stay connected via our newsletter
              </Link>
            </Grid>
            <Grid item sm={12} md={6}>
              <Typography
                component="div"
                variant="h6"
                gutterBottom
                className={classes.gridTitle}
              >
                Training the next generation of reviewers
              </Typography>
              <Typography
                component="div"
                variant="body1"
                className={classes.gridContent}
                gutterBottom
              >
                PREreview Open Reviewers is a peer review program where
                early-career researchers receive 1:1 mentorship and training on
                constructive feedback, implicit bias in science, and nonviolent
                communication.
              </Typography>
              <Typography
                component="div"
                variant="body1"
                className={classes.gridContent}
                gutterBottom
              >
                Our graduates join a list of diverse trained reviewers made
                available to editors.
              </Typography>
              <Link href="#FIXME" className={classes.gridLink}>
                Learn more and get involved
              </Link>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
