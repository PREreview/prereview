// base imports
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetCommunity } from '../hooks/api-hooks.tsx';

// components
import HeaderBar from './header-bar';
import Loading from './loading';
import NotFound from './not-found';
import ImageEditor from './image-editor';

// Material-ui components
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  banner: {
    background: 'rgba(255, 255, 255, 0.75)',
    maxWidth: theme.breakpoints.values['md'],
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: theme.spacing(4),
    paddingBottom: theme.spacing(6),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    paddingTop: theme.spacing(12),
    [theme.breakpoints.up('lg')]: {
      paddingTop: theme.spacing(16),
      paddingBottom: theme.spacing(8),
      textAlign: 'left',
    },
  },
  bannerUpload: {
    display: 'block',
    maxWidth: 400,
    marginBottom: '1rem',
  },
  button: {
    textTransform: 'none',
  },
}));

const CommunityPanel = () => {
  const classes = useStyles();
  const { id } = useParams();
  const [user] = useContext(UserProvider.context);

  const [inputs, setInputs] = useState({});

  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState(null);

  const {
    data: communityData,
    loadingCommunity,
    errorCommunity,
  } = useGetCommunity({ id: id });

  const readFileDataAsBase64 = e => {
    const file = e.target.files[0];

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        resolve(event.target.result);
      };

      reader.onerror = err => {
        reject(err);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleBannerChange = event => {
    readFileDataAsBase64(event)
      .then(response => {
        setInputs(inputs => ({
          ...inputs,
          banner: response,
        }));
        return response;
      })
      .catch(error => {
        console.error('error:', error);
        throw Error(error.statusText);
      });
  };

  useEffect(() => {
    if (!loadingCommunity) {
      if (communityData) {
        console.log(communityData.data[0]);
        setCommunity(communityData.data[0]);
        setLoading(false);
      }
    }
  }, [loadingCommunity, communityData]);

  if (loading) {
    return <Loading />;
  } else if (errorCommunity) {
    return <NotFound />;
  } else {
    return (
      <>
        <Helmet>
          <title>{community.name}</title>
        </Helmet>

        <HeaderBar thisUser={user} />
        <section>
          <Container
            maxWidth="lg"
            style={
              community.banner
                ? {
                    backgroundImage: `url(${community.banner})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                  }
                : null
            }
          >
            <Box className={classes.banner}>
              <Typography variant="h3" component="h1" gutterBottom={true}>
                {community.name}
              </Typography>
            </Box>
          </Container>
        </section>
        <section>
          <Container maxWidth="md">
            <Box mb={4}>
              <Typography variant="h4" component="h2" gutterBottom={true}>
                Banner
              </Typography>
              <img
                src={inputs.banner || community.banner || ''}
                aria-hidden="true"
                className={classes.bannerUpload}
              />
              <form>
                <Button
                  color="primary"
                  variant="contained"
                  component="label"
                  className={classes.button}
                  defaultValue={community.banner || ''}
                  onChange={handleBannerChange}
                >
                  Upload File
                  <input type="file" hidden />
                </Button>
              </form>
            </Box>
            <Box mb={4}>
              <Typography variant="h4" component="h2" gutterBottom={true}>
                Description
              </Typography>
            </Box>
            <Box mb={4}>
              <Typography variant="h4" component="h2" gutterBottom={true}>
                Users
              </Typography>
            </Box>
            <Box mb={4}>
              <Typography variant="h4" component="h2" gutterBottom={true}>
                Events
              </Typography>
            </Box>
            <Box mb={4}>
              <Typography variant="h4" component="h2" gutterBottom={true}>
                Tags
              </Typography>
            </Box>
          </Container>
        </section>
      </>
    );
  }
};

export default CommunityPanel;
