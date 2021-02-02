// base imports
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import {
  useDeleteCommunityMember,
  useGetCommunity,
} from '../hooks/api-hooks.tsx';

// components
import AddEvent from './add-event';
import AddUser from './add-user';
import HeaderBar from './header-bar';
import Loading from './loading';
import NotFound from './not-found';

// Material-ui components
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// icons
import ClearIcon from '@material-ui/icons/Clear';

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
  textField: {
    width: '100%',
  },
}));

const CommunityPanel = () => {
  const classes = useStyles();
  const intl = useIntl();
  const { id } = useParams();
  const [user] = useContext(UserProvider.context);

  const [inputs, setInputs] = useState({});

  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState(null);

  /* API calls*/
  // fetch community
  const {
    data: communityData,
    loadingCommunity,
    errorCommunity,
  } = useGetCommunity({ id: id });

  // delete member from community
  const { mutate: deleteCommunityMember } = useDeleteCommunityMember({
    id: id,
  });

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

  // update inputs with new values
  const handleInputChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  // handle banner change differently because it is more complex
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

  // delete user from community
  const handleRemoveUser = member => {
    if (
      confirm(
        `Are you sure you want to remove ${member.name} from this community?`,
      )
    ) {
      deleteCommunityMember({ uid: member.uuid })
        .then(() => alert(`Member has been removed from the community.`))
        .catch(err => alert(`An error occurred: ${err.message}`));
    }
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
            <form>
              <Box mb={4}>
                <Typography variant="h4" component="h2" gutterBottom={true}>
                  Banner
                </Typography>
                <img
                  src={inputs.banner || community.banner || ''}
                  aria-hidden="true"
                  className={classes.bannerUpload}
                />
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
              </Box>
              <Box mb={4}>
                <Typography variant="h4" component="h2" gutterBottom={true}>
                  Description
                </Typography>
                <TextField
                  id="description"
                  name="description"
                  label="Enter a description here"
                  multiline
                  rows={3}
                  defaultValue={community.description || ''}
                  variant="outlined"
                  className={classes.textField}
                  onChange={handleInputChange}
                />
              </Box>
              <Box mb={4}>
                <Typography variant="h4" component="h2" gutterBottom={true}>
                  Users
                </Typography>
                <AddUser community={community.uuid} />
                {community.members.map(member => {
                  return (
                    <Box key={member.uuid} mt={2}>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item>
                          <Avatar
                            alt={member.name}
                            src={member.avatar}
                            className={classes.avatar}
                          />
                        </Grid>
                        <Grid item>
                          <Typography
                            variant="h6"
                            component="h4"
                            gutterBottom={true}
                          >
                            {member.name}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <IconButton onClick={() => handleRemoveUser(member)}>
                            <ClearIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  );
                })}
              </Box>
              <Box mb={4}>
                <Typography variant="h4" component="h2" gutterBottom={true}>
                  Events
                </Typography>
                <AddEvent community={community.uuid} />
                {community.events.map(event => {
                  return (
                    <Box key={event.uuid} mt={2}>
                      <Grid container spacing={2} justify="flex-start">
                        <Grid item>
                          <Typography
                            color="primary"
                            variant="h6"
                            component="h4"
                            gutterBottom={true}
                          >
                            {new Intl.DateTimeFormat(intl.locale, {
                              month: 'short',
                              day: 'numeric',
                            }).format(Date.parse(event.start))}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography
                            color="textPrimary"
                            variant="h6"
                            component="h4"
                            gutterBottom={true}
                          >
                            {event.title}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  );
                })}
              </Box>
              <Box mb={4}>
                <Typography variant="h4" component="h2" gutterBottom={true}>
                  Tags
                </Typography>
              </Box>
            </form>
          </Container>
        </section>
      </>
    );
  }
};

export default CommunityPanel;
