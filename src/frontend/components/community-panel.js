// base imports
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import {
  useDeleteCommunityEvent,
  useDeleteCommunityMember,
  useDeleteCommunityOwner,
  useDeleteCommunityTag,
  useGetCommunity,
  usePutCommunity,
} from '../hooks/api-hooks.tsx';

// components
import AddEvent from './add-event';
import AddTag from './add-tag';
import AddUser from './add-user';
import HeaderBar from './header-bar';
import Loading from './loading';
import NotFound from './not-found';

// Material-ui components
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
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
    marginBottom: '3rem',
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

  // update community info
  // delete member from community
  const { mutate: updateCommunity } = usePutCommunity({
    id: id,
  });

  // remove user from being owner/moderator
  const { mutate: deleteCommunityModerator } = useDeleteCommunityMember({
    id: id,
  }); // #FIXME fix route when moderator is added

  // delete member from community
  const { mutate: deleteCommunityMember } = useDeleteCommunityMember({
    id: id,
  });

  // delete tag from community
  const { mutate: deleteCommunityTag } = useDeleteCommunityTag({
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

  // save banner and description to API
  const handleSubmit = () => {
    updateCommunity(inputs)
      .then(() => alert(`Community updated successfully.`))
      .catch(err => alert(`An error occurred: ${err.message}`));
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

  // remove user from community moderator
  const handleRemoveModerator = owner => {
    if (
      confirm(
        `Are you sure you want to remove ${owner.name} as a moderator of this community?`,
      )
    ) {
      deleteCommunityModerator({ uid: owner.uuid })
        .then(() => alert(`User is no longer a moderator of this community.`))
        .catch(err => alert(`An error occurred: ${err.message}`));
    }
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

  // delete tag from community
  const handleRemoveTag = tag => {
    if (
      confirm(
        `Are you sure you want to remove the tag "${tag.name
        }" from this community?`,
      )
    ) {
      deleteCommunityTag({ tid: tag.uuid })
        .then(() => alert(`Tag has been removed from the community.`))
        .catch(err => alert(`An error occurred: ${err.message}`));
    }
  };

  useEffect(() => {
    if (!loadingCommunity) {
      if (communityData) {
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
            maxWidth="false"
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
            <Container maxWidth="lg">
              <Box className={classes.banner}>
                <Typography variant="h3" component="h1" gutterBottom={true}>
                  {community.name}
                </Typography>
              </Box>
            </Container>
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
                  variant="outlined"
                  component="label"
                  className={classes.button}
                  defaultValue={community.banner || ''}
                  onChange={handleBannerChange}
                >
                  Upload File
                  <input type="file" hidden />
                </Button>
              </Box>
              <Box mb={4} pb={4} borderBottom="1px solid #ccc">
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
                <Button
                  color="primary"
                  variant="contained"
                  component="label"
                  className={classes.button}
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </Box>
              <Box mb={4}>
                <Typography variant="h4" component="h2" gutterBottom={true}>
                  Moderators
                </Typography>
                <AddUser community={community} isModerator={true} />
                {community.owners.map(owner => {
                  return (
                    <DeleteCommunityMember communityId={community.uuid} member={owner} isOwner={true} />
                  );
                })}
              </Box>
              <Box mb={4}>
                <Typography variant="h4" component="h2" gutterBottom={true}>
                  Users
                </Typography>
                <AddUser community={community} />
                {community.members.map(member => {
                  return (
                    <DeleteCommunityMember communityId={community.uuid} member={member} isOwner={false} />
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
                    <DeleteCommunityEvent communityId={community.uuid} event={event} />
                  );
                })}
              </Box>
              <Box mb={4}>
                <Typography variant="h4" component="h2" gutterBottom={true}>
                  Tags
                </Typography>
                <AddTag community={community.uuid} />
                {community.tags.map(tag => {
                  return (
                    <DeleteCommunityTag communityId={community.uuid} tag={tag} />
                  );
                })}
              </Box>
            </form>
          </Container>
        </section>
      </>
    );
  }
};

function DeleteCommunityMember({ communityId, member, isOwner }) {
  const classes = useStyles();

  // remove user from being owner/moderator
  const { mutate: deleteCommunityOwner } = useDeleteCommunityOwner({
    id: communityId,
    queryParams: {
      uid: member.uuid,
    },
  }); // #FIXME fix route when moderator is added

  // delete member from community
  const { mutate: deleteCommunityMember } = useDeleteCommunityMember({
    id: communityId,
    queryParams: {
      uid: member.uuid,
    },
  });

  // delete member from community
  const handleDeleteMember = persona => {
    if (isOwner) {
      if (
        confirm(
          `Are you sure you want to remove ${
            persona.name
          } as a moderator of this community?`,
        )
      ) {
        deleteCommunityOwner()
          .then(() => alert(`User is no longer a moderator of this community.`))
          .catch(err => alert(`An error occurred: ${err.message}`));
      }
    } else {
      if (
        confirm(
          `Are you sure you want to remove ${
            persona.name
          } from this community?`,
        )
      ) {
        deleteCommunityMember()
          .then(() => alert(`Member has been removed from the community.`))
          .catch(err => alert(`An error occurred: ${err.message}`));
      }
    }
  };

  return (
    <>
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
            <Typography variant="h6" component="h4" gutterBottom={true}>
              {member.name}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={() => handleDeleteMember(member)}>
              <ClearIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

DeleteCommunityMember.propTypes = {
  communityId: PropTypes.string,
  member: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
    uuid: PropTypes.string,
  }),
  isOwner: PropTypes.bool,
};

function DeleteCommunityEvent({ communityId, event }) {
  const intl = useIntl();

  const { mutate: deleteCommunityEvent } = useDeleteCommunityEvent({
    id: communityId,
    queryParams: {
      eid: event.uuid,
    },
  });

  const handleDeleteEvent = event => {
    if (
      confirm(
        `Are you sure you want to remove ${event.title} from this community?`,
      )
    ) {
      deleteCommunityEvent()
        .then(() => alert(`Event has been removed from the community.`))
        .catch(err => alert(`An error occurred: ${err.message}`));
    }
  };

  return (
    <>
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
          <Grid item>
            <IconButton onClick={() => handleDeleteEvent(event)}>
              <ClearIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

DeleteCommunityEvent.propTypes = {
  communityId: PropTypes.string,
  event: PropTypes.shape({
    title: PropTypes.string,
    start: PropTypes.date,
    uuid: PropTypes.string,
  }),
};

function DeleteCommunityTag({ communityId, tag }) {
  const { mutate: deleteCommunityTag } = useDeleteCommunityTag({
    id: communityId,
    queryParams: {
      tid: tag.uuid,
    },
  });

  const handleDeleteTag = tag => {
    if (
      confirm(
        `Are you sure you want to remove ${tag.title} from this community?`,
      )
    ) {
      deleteCommunityTag()
        .then(() => alert(`Tag has been removed from the community.`))
        .catch(err => alert(`An error occurred: ${err.message}`));
    }
  };

  return (
    <>
      <Box key={tag.uuid} mt={2}>
        <Grid container spacing={2}>
          <Grid item>
            <Typography variant="h6" component="h4" gutterBottom={true}>
              {tag.name}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={() => handleDeleteTag(tag)}>
              <ClearIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

DeleteCommunityTag.propTypes = {
  communityId: PropTypes.string,
  tag: PropTypes.shape({
    name: PropTypes.string,
    color: PropTypes.string,
    uuid: PropTypes.string,
  }),
};

export default CommunityPanel;
