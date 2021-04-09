// base imports
import React, { createRef, useContext, useEffect, useState } from 'react';
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
  const { id } = useParams();
  const [user] = useContext(UserProvider.context);

  const [inputs, setInputs] = useState({});

  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState(null);
  const bannerRef = createRef(null);

  /* API calls*/
  // fetch community
  const {
    data: communityData,
    loadingCommunity,
    errorCommunity,
  } = useGetCommunity({ id: id, resolve: community => community.data[0] });

  // update community info
  // delete member from community
  const { mutate: updateCommunity } = usePutCommunity({
    id: id,
  });

  const readFileDataAsBase64 = e => {
    const file = e.target.files[0];

    return new Promise((resolve, reject) => {
      const image = URL.createObjectURL(file);
      resolve(image);

      //image.onload = event => {
      //  URL
      //  resolve(event.target.result);
      //};

      //image.onerror = err => {
      //  reject(err);
      //};
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
    const newBanner = event.target.files[0];
    if (newBanner) {
      if (community.banner) {
        URL.revokeObjectURL(community.banner);
        bannerRef.current.value = null;
      }
      setCommunity({ ...community, banner: URL.createObjectURL(newBanner) });
    }
  };

  const handleAddUser = (user, isOwner) => {
    let oldUsers, users;
    if (isOwner) {
      oldUsers = community.owners;
      users = [...oldUsers, user];
    } else {
      oldUsers = community.members;
      users = [...oldUsers, user];
    }
    const newCommunity = { ...community, users };
    setCommunity(newCommunity);
  };

  const handleDeleteOwner = owner => {
    const { owners: personas } = community;

    const owners = personas.filter(persona => persona.uuid !== owner.uuid);
    setCommunity({ ...community, owners });
  };

  const handleDeleteMember = member => {
    const { members: personas } = community;

    const members = personas.filter(persona => persona.uuid !== member.uuid);
    setCommunity({ ...community, members });
  };

  const handleAddEvent = event => {
    const oldEvents = community.events;
    const events = [...oldEvents, event];
    const newCommunity = { ...community, events };
    setCommunity(newCommunity);
  };

  const handleDeleteEvent = event => {
    const { events: oldEvents } = community;

    const events = oldEvents.filter(e => e.uuid !== event.uuid);
    setCommunity({ ...community, events });
  };

  const handleAddTag = tag => {
    const oldTags = community.tags;
    const tags = [...oldTags, tag];
    const newCommunity = { ...community, tags };
    setCommunity(newCommunity);
  };

  const handleDeleteTag = tag => {
    const { tags: oldTags } = community;

    const tags = oldTags.filter(t => t.uuid !== tag.uuid);
    setCommunity({ ...community, tags });
  };

  useEffect(() => {
    if (!loadingCommunity) {
      if (communityData) {
        setCommunity(communityData);
        setLoading(false);
      }
    }
  }, [loadingCommunity, communityData]);

  useEffect(() => {}, [community]);

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
            maxWidth={false}
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
                  ref={bannerRef}
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
                <AddUser
                  addUser={handleAddUser}
                  community={community}
                  isModerator={true}
                />
                {community.owners && community.owners.length
                  ? community.owners.map(owner => {
                      return (
                        <DeleteCommunityMember
                          key={owner.uuid}
                          communityId={community.uuid}
                          member={owner}
                          deleteMember={handleDeleteOwner}
                          isOwner={true}
                        />
                      );
                    })
                  : null}
              </Box>
              <Box mb={4}>
                <Typography variant="h4" component="h2" gutterBottom={true}>
                  Users
                </Typography>
                <AddUser community={community} addUser={handleAddUser} />
                {community.members && community.members.length
                  ? community.members.map(member => {
                      return (
                        <DeleteCommunityMember
                          key={member.uuid}
                          communityId={community.uuid}
                          member={member}
                          deleteMember={handleDeleteMember}
                          isOwner={false}
                        />
                      );
                    })
                  : null}
              </Box>
              <Box mb={4}>
                <Typography variant="h4" component="h2" gutterBottom={true}>
                  Events
                </Typography>
                <AddEvent
                  community={community.uuid}
                  addEvent={handleAddEvent}
                />
                {community.events && community.events.length
                  ? community.events.map(event => {
                      return (
                        <CommunityEvent
                          key={event.uuid}
                          communityId={community.uuid}
                          deleteEvent={handleDeleteEvent}
                          event={event}
                        />
                      );
                    })
                  : null}
              </Box>
              <Box mb={4}>
                <Typography variant="h4" component="h2" gutterBottom={true}>
                  Tags
                </Typography>
                <AddTag community={community.uuid} addTag={handleAddTag} />
                {community.tags && community.tags.length
                  ? community.tags.map(tag => {
                      return (
                        <DeleteCommunityTag
                          key={tag.uuid}
                          communityId={community.uuid}
                          deleteTag={handleDeleteTag}
                          tag={tag}
                        />
                      );
                    })
                  : null}
              </Box>
            </form>
          </Container>
        </section>
      </>
    );
  }
};

function DeleteCommunityMember({ communityId, member, deleteMember, isOwner }) {
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
          .then(() => deleteMember(persona))
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
          .then(() => deleteMember(persona))
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
    avatar: PropTypes.object,
    uuid: PropTypes.string,
  }),
  deleteMember: PropTypes.func,
  isOwner: PropTypes.bool,
};

function CommunityEvent({ communityId, event, deleteEvent }) {
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
        `Are you sure you want to remove event ${
          event.title
        } from this community?`,
      )
    ) {
      deleteCommunityEvent()
        .then(() => deleteEvent(event))
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

CommunityEvent.propTypes = {
  communityId: PropTypes.string,
  event: PropTypes.shape({
    title: PropTypes.string,
    start: PropTypes.date,
    uuid: PropTypes.string,
  }),
  deleteEvent: PropTypes.func,
};

function DeleteCommunityTag({ communityId, tag, deleteTag }) {
  const { mutate: deleteCommunityTag } = useDeleteCommunityTag({
    id: communityId,
    queryParams: {
      tid: tag.uuid,
    },
  });

  const handleDeleteTag = tag => {
    if (
      confirm(
        `Are you sure you want to remove tag ${tag.name} from this community?`,
      )
    ) {
      deleteCommunityTag()
        .then(() => deleteTag(tag))
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
  deleteTag: PropTypes.func,
};

export default CommunityPanel;
