// base imports
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactCardFlip from 'react-card-flip';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// hooks
import { useIsNewVisitor, useIsMobile } from '../hooks/ui-hooks';

// utils
import { processParams } from '../utils/search';

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
import Hidden from '@material-ui/core/Hidden';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

// components
import Footer from './footer';
import HeaderBar from './header-bar';
import SearchBar from './search-bar';
import WelcomeModal from './welcome-modal';

// images
import HeroImg from '../assets/images/home/hero.svg';
import Card1 from '../assets/images/home/card-1.svg';
import Card2 from '../assets/images/home/card-2.svg';
import Card3 from '../assets/images/home/card-3.svg';
import CommunitiesImg from '../assets/images/home/communities.jpg';

// sponsor logos
import APSImg from '../assets/images/sponsors/aps-foundation.png';
import ElifeImg from '../assets/images/sponsors/elife.jpg';
import IOIImg from '../assets/images/sponsors/ioi.png';
import MozillaImg from '../assets/images/sponsors/mozilla.png';
import WellcomeImg from '../assets/images/sponsors/wellcome.jpg';

// press and awards images
import ASAPbioImg from '../assets/images/press-awards/ASAPbio.jpg';
import Bio2040Img from '../assets/images/press-awards/bio2040.jpg';
import JROSTImg from '../assets/images/press-awards/JROST.png';
import NatureOSrPREImg from '../assets/images/press-awards/nature-comm-OSrPRE.png';
import NatureIndexImg from '../assets/images/press-awards/nature-index.jpg';
import NoManifestoImg from '../assets/images/press-awards/no-manifesto.png';
import SCMornPostImg from '../assets/images/press-awards/sc-morning-post.jpg';
import SPARCImg from '../assets/images/press-awards/sparc.jpg';
import LancetImg from '../assets/images/press-awards/the-lancet.jpg';

// constants
import { ORG } from '../constants';

const useStyles = makeStyles(theme => ({
  buttonBox: {
    background: theme.palette.primary.main,
    borderRadius: '20px',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    maxWidth: 360,
    position: 'relative',
    textAlign: 'center',
    '&:active, &:focus, &:hover': {
      background: theme.palette.primary.dark,
      textDecoration: 'underline',
    },
  },
  buttonLink: {
    color: '#fff !important',
    display: 'block',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    padding: '20px',
  },
  card: {
    borderRadius: 32,
    height: 350,
    marginBottom: '1rem',
    [theme.breakpoints.up('md')]: {
      height: 580,
      width: '30%',
    },
  },
  cardAction: {
    height: '100%',
  },
  cardBack: {
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
    marginBottom: 30,
  },
  gridContent: {
    marginBottom: 30,
  },
  gridContentLink: {
    color: `#000 !important`,
    fontWeight: 'bold',
  },
  gridLink: {
    backgroundColor: theme.palette.community.main,
    borderRadius: '20px',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    color: '#000 !important',
    display: 'inline-block',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginTop: '20px',
    padding: '20px',
    '&:hover': {
      backgroundColor: theme.palette.community.dark,
    },
  },
  hero: {
    [theme.breakpoints.up('md')]: {
      backgroundImage: `url(${HeroImg})`,
      backgroundPosition: 'right bottom -22px',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '600px',
      paddingBottom: '4rem',
      paddingTop: '6rem',
    },
  },
  heroContent: {
    [theme.breakpoints.up('md')]: {
      maxWidth: '70%',
    },
  },
  heroContentSubtext: {
    [theme.breakpoints.up('md')]: {
      maxWidth: '75%',
    },
  },
  heroContentText: {
    [theme.breakpoints.up('md')]: {
      // fontSize: '2.5rem',
      // lineHeight: '57px',
    },
  },
  home: {
    overflow: 'hidden',
  },
  img: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 800,
    width: '100%',
  },
  sliderImage: {
    display: 'block',
    maxWidth: 475,
    objectFit: 'cover',
    width: '100%',
  },
  sliderItem: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  sliderLink: {
    borderRadius: 14,
    fontSize: '1rem',
    paddingBottom: 10,
    paddingTop: 10,
  },
  sliderTitle: {
    color: '#54948E',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  sponsorImage: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxHeight: '140px',
    maxWidth: '300px',
    objectFit: 'contain',
    width: '100%',
  },
  standout: {},
  standoutLink: {
    color: '#fff !important',
    textDecoration: 'underline',
    '&:hover': {
      color: '#000 !important',
    },
  },
  vh: {
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: 1,
  },
}));

export default function Home() {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const params = processParams(location.search);

  const [thisUser] = useContext(UserProvider.context);

  /* React Card Flip vars and functions */
  const [isFlipped, setIsFlipped] = useState([false, false, false]);
  const isMobile = useIsMobile();
  const isNewVisitor = useIsNewVisitor();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);
  const [search, setSearch] = useState(params.get('search') || '');
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile);

  const handleFlip = (index, flip) => {
    let updatedFlipped = [...isFlipped];
    updatedFlipped[index] = flip;
    //updatedFlipped[index] = !isFlipped[index];
    setIsFlipped(updatedFlipped);
  };

  /* Slider settings */
  const settings = {
    autoplay: true,
    autoplaySpeed: 6000,
    centerPadding: '80px',
    dots: true,
  };

  useEffect(() => {}, [isFlipped, search]);

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

      <Box className={classes.hero}>
        <Container>
          <Box mb={4} className={classes.heroContent}>
            <Typography
              variant="h1"
              component="div"
              className={classes.heroContentText}
              gutterBottom
            >
              Catalyzing change in peer review through equity, openness, and
              collaboration
            </Typography>
            <Typography
              variant="h3"
              component="div"
              className={classes.heroContentSubtext}
            >
              PREreview is a platform, resource center and convener. We provide
              ways for feedback to preprints to be done openly, rapidly,
              constructively, and by a global community of peers. Join us!
            </Typography>
            <Box my={6} className={classes.buttonBox}>
              <Link href="/login" className={classes.buttonLink}>
                Start reviewing now
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
      <Hidden xsUp>
        <Typography component="h2">Search</Typography>
      </Hidden>
      <Box bgcolor="#D2D1CE" py={8}>
        <Container>
          <Typography variant="h3" component="div">
            Search and browse preprint reviews
          </Typography>
          <Box mt={3}>
            <SearchBar
              placeholderValue="Search preprints by title, author, abstract, DOI, or arXiv ID"
              onChange={value => {
                params.delete('page');
                setSearch(value);
              }}
              onCancelSearch={() => {
                params.delete('search');
                setSearch('');
                history.push({
                  pathname: '/reviews',
                  search: `${params.toString()}&search=${search}`,
                });
              }}
              onRequestSearch={() => {
                params.set('search', search);
                params.delete('page');
                history.push({
                  pathname: '/reviews',
                  search: params.toString(),
                });
              }}
            />
          </Box>
        </Container>
      </Box>
      <Hidden xsUp>
        <Typography component="h2">About PREreview</Typography>
      </Hidden>
      <Box py={8} className={classes.cardsBox}>
        <Container className={classes.cards}>
          <Card className={classes.card} elevation={3}>
            {/* FIXME loop*/}
            <CardActionArea
              className={classes.cardAction}
              onMouseEnter={() => handleFlip(0, true)}
              onMouseLeave={() => handleFlip(0, false)}
            >
              <ReactCardFlip
                className={classes.cardContent}
                isFlipped={isFlipped[0]}
                containerStyle={{ height: '100%' }}
              >
                <Box p={3} className={classes.cardFront}>
                  <CardContent>
                    <Typography component="h2" variant="h2" align="center">
                      Preprint Review Platform
                    </Typography>
                  </CardContent>
                  <CardMedia>
                    <img
                      className={classes.cardImage}
                      src={Card1}
                      alt=""
                      aria-hidden="true"
                    />
                  </CardMedia>
                </Box>
                <Box p={3} className={classes.cardBack}>
                  <Typography component="div" gutterBottom>
                    <Link href="/reviews" className={classes.cardTitle}>
                      A platform for crowdsourcing of preprint reviews
                    </Link>
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <b>Read, request, and write</b> rapid and full preprint
                    reviews
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <b>Work collaboratively</b> with your peers or find a mentor
                    who can help you write your review
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <b>Build your profile</b> as an expert reviewer and get
                    recognized for your contributions
                  </Typography>
                </Box>
              </ReactCardFlip>
            </CardActionArea>
          </Card>
          <Card className={classes.card} elevation={3}>
            <CardActionArea
              className={classes.cardAction}
              onMouseEnter={() => handleFlip(1, true)}
              onMouseLeave={() => handleFlip(1, false)}
            >
              <ReactCardFlip
                className={classes.cardContent}
                isFlipped={isFlipped[1]}
                containerStyle={{ height: '100%' }}
              >
                <Box p={3} className={classes.cardFront}>
                  <CardContent>
                    <Typography component="h2" variant="h2" align="center">
                      Resource Center
                    </Typography>
                  </CardContent>
                  <CardMedia>
                    <img
                      className={classes.cardImage}
                      src={Card2}
                      alt=""
                      aria-hidden="true"
                    />
                  </CardMedia>
                </Box>
                <Box p={3} className={classes.cardBack}>
                  <Typography component="div" gutterBottom>
                    <Link
                      href="https://content.prereview.org/resources/"
                      className={classes.cardTitle}
                    >
                      A space to grow as a socially-conscious, constructive
                      reviewer
                    </Link>
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <b>Learn</b> how to provide constructive feedback
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <b>Discover</b> your biases and how to mitigate them
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <b>Repurpose</b> journal clubs to collaboratively discuss
                    and review preprints
                  </Typography>
                </Box>
              </ReactCardFlip>
            </CardActionArea>
          </Card>
          <Card className={classes.card} elevation={3}>
            <CardActionArea
              className={classes.cardAction}
              onMouseEnter={() => handleFlip(2, true)}
              onMouseLeave={() => handleFlip(2, false)}
            >
              <ReactCardFlip
                className={classes.cardContent}
                isFlipped={isFlipped[2]}
                containerStyle={{ height: '100%' }}
              >
                <Box p={3} className={classes.cardFront}>
                  <CardContent>
                    <Typography component="h2" variant="h2" align="center">
                      PREreview Communities
                    </Typography>
                  </CardContent>
                  <CardMedia>
                    <img
                      className={classes.cardImage}
                      src={Card3}
                      alt=""
                      aria-hidden="true"
                    />
                  </CardMedia>
                </Box>
                <Box p={3} className={classes.cardBack}>
                  <Typography component="div" gutterBottom>
                    <Link href="/communities" className={classes.cardTitle}>
                      A hub for peer review communities
                    </Link>
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <b>Find</b> communities that are discussing research
                    relevant to you
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <b>Join and engage</b> with a global network of peers
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <b>Start and lead</b> your own PREreview community
                  </Typography>
                </Box>
              </ReactCardFlip>
            </CardActionArea>
          </Card>
        </Container>
      </Box>
      <Box bgcolor="#54948E" color="#fff" textAlign="center" py={8}>
        <Container>
          <Typography component="div" variant="h1" className={classes.standout}>
            We believe in equitable access, connecting people, self reflection,
            and measurable success.
          </Typography>
        </Container>
      </Box>
      <Box py={8} textAlign="center">
        <Container>
          <Grid container spacing={10} alignItems="flex-start" justify="center">
            <Grid item xs={12}>
              <Typography
                component="div"
                variant="h2"
                gutterBottom
                className={classes.gridTitle}
              >
                Inviting everyone to the table
              </Typography>
              <Typography
                component="div"
                variant="h3"
                className={classes.gridContent}
                gutterBottom
              >
                Researchers can join or start their own community to bring
                together peers with shared interests and values.
              </Typography>
              <Typography
                component="div"
                variant="h3"
                className={classes.gridContent}
              >
                We are committed to providing a safe space for all voices to be
                heard without fear of retribution by enforcing a{' '}
                <Link
                  href="https://content.prereview.org/coc"
                  className={classes.gridContentLink}
                >
                  Code of Conduct
                </Link>
                .
              </Typography>
              <img
                src={CommunitiesImg}
                alt=""
                aria-hidden="true"
                className={classes.img}
              />
              <Link href="/communities" className={classes.gridLink}>
                Explore Communities
              </Link>
            </Grid>
            <Grid item sm={12} md={5}>
              <Typography
                component="div"
                variant="h2"
                gutterBottom
                className={classes.gridTitle}
              >
                Bringing researchers together
              </Typography>
              <Typography
                component="div"
                variant="h3"
                className={classes.gridContent}
                gutterBottom
              >
                Live-streamed preprint journal clubs allow for researchers to
                engage globally and hold timely discussions around preprints.
              </Typography>
              <Typography
                component="div"
                variant="h3"
                className={classes.gridContent}
                gutterBottom
              >
                PREreview workshops and sprints facilitate conversations and
                co-creation of content across research communities to improve
                diversity and openness in peer review.
              </Typography>
              <Link
                href="https://mailchi.mp/97886570610a/prereview-newsletter-signup"
                className={classes.gridLink}
              >
                Stay connected via our newsletter
              </Link>
            </Grid>
            <Grid item sm={12} md={5}>
              <Typography
                component="div"
                variant="h2"
                gutterBottom
                className={classes.gridTitle}
              >
                Training the next generation of reviewers
              </Typography>
              <Typography
                component="div"
                variant="h3"
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
                variant="h3"
                className={classes.gridContent}
                gutterBottom
              >
                Our graduates join a list of diverse trained reviewers made
                available to editors.
              </Typography>
              <Link
                href="https://content.prereview.org/openreviewers"
                className={classes.gridLink}
              >
                Learn more and get involved
              </Link>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box bgcolor="#54948E" color="#fff" textAlign="center" py={8}>
        <Container>
          <Slider {...settings}>
            <Box>
              <Typography
                component="div"
                variant="h2"
                className={classes.gridContent}
                gutterBottom
              >
                Inexperience is the greatest barrier to gaining experience. Not
                only do I not know where to start, I also do not know how to get
                there. Furthermore, the only advice I have ever received on the
                topic [of peer review] has been &quot;Don&apos;t do it. It’s a
                waste of time that doesn&apos;t contribute to your career&quot;,
                which epitomizes the core problems causing the rot we see in
                peer review.
              </Typography>
              <Typography
                component="div"
                variant="h3"
                className={classes.gridContent}
                gutterBottom
              >
                —&#8202;Juan Manuel Vazquez, PREreview Open Reviewer 2021
              </Typography>
            </Box>
            <Box>
              <Typography
                component="div"
                variant="h2"
                className={classes.gridContent}
                gutterBottom
              >
                Please continue to train and recruit young reviewers.
              </Typography>
              <Typography
                component="div"
                variant="h3"
                className={classes.gridContent}
                gutterBottom
              >
                —&#8202;Kishore Wary, PREreview Open Reviewer Mentor 2021
              </Typography>
            </Box>
            <Box>
              <Typography
                component="div"
                variant="h2"
                className={classes.gridContent}
                gutterBottom
              >
                Science has a racism issue. Many discovered this issue recently
                with the murder of George Floyd and Breonna Taylor. But we
                (people of color and underrepresented in science) knew about
                this a while ago. I believe to balance the inequalities in the
                scientific enterprise, we should tackle different angles that
                include but are not limited to scientific training, recruitment,
                and support. Peer review is an important stage for scientific
                progress so by diversifying the reviewer pool we can push the
                needle forward and start to provide different voices to the
                reviewing process.
              </Typography>
              <Typography
                component="div"
                variant="h3"
                className={classes.gridContent}
                gutterBottom
              >
                —&#8202;Joel Encarnacion-Rosado, PREreview Open Reviewer 2021
              </Typography>
            </Box>
            <Box>
              <Typography
                component="div"
                variant="h2"
                className={classes.gridContent}
                gutterBottom
              >
                If we really want to diversify science we need to diversify the
                people who are labeled as &quot;expert&quot; in a field and
                [who] have the power to evaluate the quality of their
                peers&apos; work.
              </Typography>
              <Typography
                component="div"
                variant="h3"
                className={classes.gridContent}
                gutterBottom
              >
                —&#8202;Natalia Torres, PREreview Open Reviewer 2021
              </Typography>
            </Box>
            <Box>
              <Typography
                component="div"
                variant="h2"
                className={classes.gridContent}
                gutterBottom
              >
                My expectations were fully met and beyond. I felt that the
                discussions on non-violent communication tied with the
                anti-bias/systems of oppression discussions really highlighted
                how valuable and important this program really is to our broader
                scientific community. I am happy to have also become part of
                this growing community.
              </Typography>
              <Typography
                component="div"
                variant="h3"
                className={classes.gridContent}
                gutterBottom
              >
                —&#8202;Sergio Redondo, PREreview Open Reviewer 2021
              </Typography>
            </Box>
            <Box>
              <Typography
                component="div"
                variant="h2"
                className={classes.gridContent}
                gutterBottom
              >
                I found getting involved in the peer review process challenging.
                When I was a graduate student, journal editors seemed reluctant
                to include me as a peer reviewer. Most often, they did not want
                to challenge the status quo in peer reviewing.
              </Typography>
              <Typography
                component="div"
                variant="h3"
                className={classes.gridContent}
                gutterBottom
              >
                —&#8202;PREreview Open Reviewer 2021
              </Typography>
            </Box>
          </Slider>
        </Container>
      </Box>
      <Box py={8} textAlign="center">
        <Container>
          <Typography variant="h4" component="h2">
            Our Funders
          </Typography>
          <Box mt={8}>
            <Grid container alignItems="center" justify="center" spacing={8}>
              <Grid item sm={12} md={4}>
                <img
                  className={classes.sponsorImage}
                  src={APSImg}
                  alt="Alfred P. Sloan Foundation"
                />
              </Grid>
              <Grid item sm={12} md={4}>
                <img
                  className={classes.sponsorImage}
                  src={WellcomeImg}
                  alt="Wellcome"
                />
              </Grid>
              <Grid item sm={12} md={4}>
                <img
                  className={classes.sponsorImage}
                  src={ElifeImg}
                  alt="eLife"
                />
              </Grid>
              <Grid item sm={12} md={6}>
                <img
                  className={classes.sponsorImage}
                  src={MozillaImg}
                  alt="Mozilla"
                />
              </Grid>
              <Grid item sm={12} md={6}>
                <img className={classes.sponsorImage} src={IOIImg} alt="IOI" />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
      <Hidden xsUp>
        <Typography component="h2">Donate</Typography>
      </Hidden>
      <Box bgcolor="#54948E" color="#fff" textAlign="center" py={8}>
        <Container>
          <Typography
            component="div"
            variant="h1"
            className={classes.standout}
            gutterBottom
          >
            PREreview is a fiscally sponsored project of{' '}
            <Link
              href="https://codeforscience.org/"
              className={classes.standoutLink}
            >
              Code for Science and Society
            </Link>
            . Help us grow our impact!
          </Typography>
          <Link
            href="https://codeforscience.org/donate/prereview/"
            className={classes.gridLink}
          >
            Donate
          </Link>
        </Container>
      </Box>
      <Box py={8}>
        <Container>
          <Box mb={6} textAlign="center">
            <Typography variant="h4" component="h2" gutterBottom>
              Press &amp; Awards
            </Typography>
          </Box>
          <Slider {...settings}>
            <Box>
              <Grid
                container
                spacing={4}
                alignItems="flex-start"
                justify="center"
              >
                <Grid item xs={12} sm={4}>
                  <img
                    src={ASAPbioImg}
                    alt=""
                    aria-hidden="true"
                    className={classes.sliderImage}
                  />
                </Grid>
                <Grid
                  container
                  item
                  xs={12}
                  sm={8}
                  spacing={2}
                  alignItems="flex-end"
                  direction="column"
                >
                  <Grid item>
                    <Typography
                      component="div"
                      variant="body1"
                      className={classes.sliderTitle}
                    >
                      PREreview Awarded &quot;Best in Show&quot; at the ASAPbio
                      #PreprintSprint 2020
                    </Typography>
                    <Typography component="div" variant="body2">
                      In the fall of 2020, PREreview was one of 20 projects who
                      participated in the ASAPbio Design Sprint: Encouraging
                      Preprint Curation and Review. Our team contributed with
                      two submissions, one in which we proposed a model of
                      engagement based on mentorship and collaborative review
                      and one in collaboration with the C19 Rapid Review
                      Publishers Initiative. At the final pitch presentation on
                      December 3, our team was awarded &quot;Best in Show&quot;
                      with the first pitch.
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Link
                      href="https://asapbio.org/sprint-recap"
                      target="_blank"
                      rel="noreferrer"
                      className={`${classes.gridLink} ${classes.sliderLink}`}
                    >
                      Read More
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Grid
                container
                spacing={4}
                alignItems="flex-start"
                justify="center"
              >
                <Grid item xs={12} sm={4}>
                  <img
                    src={JROSTImg}
                    alt=""
                    aria-hidden="true"
                    className={classes.sliderImage}
                  />
                </Grid>
                <Grid
                  container
                  item
                  xs={12}
                  sm={8}
                  spacing={2}
                  alignItems="flex-end"
                  direction="column"
                >
                  <Grid item>
                    <Typography
                      component="div"
                      variant="body1"
                      className={classes.sliderTitle}
                    >
                      PREreview Awarded the JROST Rapid Response Fund
                    </Typography>
                    <Typography component="div" variant="body2">
                      In the fall of 2020, JROST announced the Rapid Response
                      Fund &quot;to create a means to give back to the open
                      infrastructure and technology community.&quot; PREreview
                      was one of eight projects who were awarded.
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Link
                      href="https://investinopen.org/blog/jrost-rapid-response-fund-awardees/"
                      target="_blank"
                      rel="noreferrer"
                      className={`${classes.gridLink} ${classes.sliderLink}`}
                    >
                      Read More
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Grid
                container
                spacing={4}
                alignItems="flex-start"
                justify="center"
              >
                <Grid item xs={12} sm={4}>
                  <img
                    src={NatureOSrPREImg}
                    alt=""
                    aria-hidden="true"
                    className={classes.sliderImage}
                  />
                </Grid>
                <Grid
                  container
                  item
                  xs={12}
                  sm={8}
                  spacing={2}
                  alignItems="flex-end"
                  direction="column"
                >
                  <Grid item>
                    <Typography
                      component="div"
                      variant="body1"
                      className={classes.sliderTitle}
                    >
                      Nature: Open peer-review platform for COVID-19 preprints
                    </Typography>
                    <Typography component="div" variant="body2">
                      Just a few weeks before the COVID-19 pandemic hit the
                      world, we launched Outbreak Science Rapid PREreview, a
                      platform for the rapid community review of
                      outbreak-related preprints–now a community on the new
                      preview.org. In this short Nature commentary, Project
                      Directors Drs. Daniela Saderi and Michael Johansson
                      presented the platform to the community.
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Link
                      href="https://www.nature.com/articles/d41586-020-00613-4"
                      target="_blank"
                      rel="noreferrer"
                      className={`${classes.gridLink} ${classes.sliderLink}`}
                    >
                      Read More
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Grid
                container
                spacing={4}
                alignItems="flex-start"
                justify="center"
              >
                <Grid item xs={12} sm={4}>
                  <img
                    src={LancetImg}
                    alt=""
                    aria-hidden="true"
                    className={classes.sliderImage}
                  />
                </Grid>
                <Grid
                  container
                  item
                  xs={12}
                  sm={8}
                  spacing={2}
                  alignItems="flex-end"
                  direction="column"
                >
                  <Grid item>
                    <Typography
                      component="div"
                      variant="body1"
                      className={classes.sliderTitle}
                    >
                      The Lancet: Lessons from the influx of preprints during
                      the early COVID-19 pandemic
                    </Typography>
                    <Typography component="div" variant="body2">
                      The COVID-19 pandemic led to an unprecedented increase in
                      the uptake of preprints within the scientific community.
                      Outbreak Science Rapid PREreview is mentioned in this
                      commentary on The Lancet as the tool that allows
                      researchers to conduct public reviews of COVID-19
                      preprints.
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Link
                      href="https://www.thelancet.com/journals/lanplh/article/PIIS2542-5196(21)00011-5/fulltext"
                      target="_blank"
                      rel="noreferrer"
                      className={`${classes.gridLink} ${classes.sliderLink}`}
                    >
                      Read More
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Grid
                container
                spacing={4}
                alignItems="flex-start"
                justify="center"
              >
                <Grid item xs={12} sm={4}>
                  <img
                    src={NatureIndexImg}
                    alt=""
                    aria-hidden="true"
                    className={classes.sliderImage}
                  />
                </Grid>
                <Grid
                  container
                  item
                  xs={12}
                  sm={8}
                  spacing={2}
                  alignItems="flex-end"
                  direction="column"
                >
                  <Grid item>
                    <Typography
                      component="div"
                      variant="body1"
                      className={classes.sliderTitle}
                    >
                      Nature Index: Three online tools aimed at improving
                      preprints
                    </Typography>
                    <Typography component="div" variant="body2">
                      PREreview showcased as one of three tools &quot;aimed at
                      helping researchers produce better preprints.&quot;
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Link
                      href="https://www.natureindex.com/news-blog/three-online-tools-aimed-at-improving-preprints"
                      target="_blank"
                      rel="noreferrer"
                      className={`${classes.gridLink} ${classes.sliderLink}`}
                    >
                      Read More
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Grid
                container
                spacing={4}
                alignItems="flex-start"
                justify="center"
              >
                <Grid item xs={12} sm={4}>
                  <img
                    src={SCMornPostImg}
                    alt=""
                    aria-hidden="true"
                    className={classes.sliderImage}
                  />
                </Grid>
                <Grid
                  container
                  item
                  xs={12}
                  sm={8}
                  spacing={2}
                  alignItems="flex-end"
                  direction="column"
                >
                  <Grid item>
                    <Typography
                      component="div"
                      variant="body1"
                      className={classes.sliderTitle}
                    >
                      South China Morning Post: Will the coronavirus kill off
                      the ‘dinosaur’ world of academic publishing?
                    </Typography>
                    <Typography component="div" variant="body2">
                      PREreview Co-Founder and Director Dr. Daniela Saderi was
                      interviewed by journalist Linda Lew for this piece on the
                      future of publishing post-pandemic.
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Link
                      href="https://www.scmp.com/news/china/article/3075431/will-coronavirus-kill-dinosaur-world-academic-publishing"
                      target="_blank"
                      rel="noreferrer"
                      className={`${classes.gridLink} ${classes.sliderLink}`}
                    >
                      Read More
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Grid
                container
                spacing={4}
                alignItems="flex-start"
                justify="center"
              >
                <Grid item xs={12} sm={4}>
                  <img
                    src={SPARCImg}
                    alt=""
                    aria-hidden="true"
                    className={classes.sliderImage}
                  />
                </Grid>
                <Grid
                  container
                  item
                  xs={12}
                  sm={8}
                  spacing={2}
                  alignItems="flex-end"
                  direction="column"
                >
                  <Grid item>
                    <Typography
                      component="div"
                      variant="body1"
                      className={classes.sliderTitle}
                    >
                      SPARC Community Member Highlight
                    </Typography>
                    <Typography component="div" variant="body2">
                      PREreview Leadership Team member and OpenCon alum Dr.
                      Monica Granados was interviewed by SPARC to present our
                      work in the context of the pandemic to the community.
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Link
                      href="https://sparcopen.org/news/2020/opencon-community-members-support-rapid-covid-response-through-preprints/"
                      target="_blank"
                      rel="noreferrer"
                      className={`${classes.gridLink} ${classes.sliderLink}`}
                    >
                      Read More
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Grid
                container
                spacing={4}
                alignItems="flex-start"
                justify="center"
              >
                <Grid item xs={12} sm={4}>
                  <img
                    src={Bio2040Img}
                    alt=""
                    aria-hidden="true"
                    className={classes.sliderImage}
                  />
                </Grid>
                <Grid
                  container
                  item
                  xs={12}
                  sm={8}
                  spacing={2}
                  alignItems="flex-end"
                  direction="column"
                >
                  <Grid item>
                    <Typography
                      component="div"
                      variant="body1"
                      className={classes.sliderTitle}
                    >
                      bio2040 Podcast: Opening up the opaque Peer Review Process
                      with Sam & Daniela from PREreview
                    </Typography>
                    <Typography component="div" variant="body2">
                      Want to learn about PREreview&apos;s first baby steps and
                      what motivated us to work on this project? Listen to
                      PREreview Co-Founders Drs. Samantha Hindle and Daniela
                      Saderi talk about it in this 2018 interview with
                      Entrepreneur and Angel Investor Flavio Rump.
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Link
                      href="https://bio2040.com/2018/04/09/opening-up-the-opaque-peer-review-process-with-sam-daniela-from-prereview/"
                      target="_blank"
                      rel="noreferrer"
                      className={`${classes.gridLink} ${classes.sliderLink}`}
                    >
                      Read More
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Grid
                container
                spacing={4}
                alignItems="flex-start"
                justify="center"
              >
                <Grid item xs={12} sm={4}>
                  <img
                    src={NoManifestoImg}
                    alt=""
                    aria-hidden="true"
                    className={classes.sliderImage}
                  />
                </Grid>
                <Grid
                  container
                  item
                  xs={12}
                  sm={8}
                  spacing={2}
                  alignItems="flex-end"
                  direction="column"
                >
                  <Grid item>
                    <Typography
                      component="div"
                      variant="body1"
                      className={classes.sliderTitle}
                    >
                      No Manifesto Podcast: A chat with PREreview Co-Founder and
                      Neuroscientist Daniela Saderi
                    </Typography>
                    <Typography component="div" variant="body2">
                      Curious about the context PREreview started? Spoiler
                      alert, it begins with a couple of somewhat frustrated but
                      optimistic early-career (neuro)scientists.
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Link
                      href="https://www.nomanifestos.com/episodes/4"
                      target="_blank"
                      rel="noreferrer"
                      className={`${classes.gridLink} ${classes.sliderLink}`}
                    >
                      Read More
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Slider>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
