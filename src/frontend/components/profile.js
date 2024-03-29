// base imports
import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useHistory } from 'react-router-dom';
import { format } from 'date-fns';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import {
  useGetExpertises,
  useGetPersona,
  usePutPersona,
  usePutUser,
} from '../hooks/api-hooks.tsx';

// Material UI components
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import MenuItem from '@material-ui/core/MenuItem';
import MuiButton from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

// components
import HeaderBar from './header-bar';
import Loading from './loading';
import RoleActivity from './role-activity';
import RoleEditor from './role-editor';
import SettingsNotifications from './settings-notifications';
import WorkCard from './work-card';

// icons
import CloseIcon from '@material-ui/icons/Close';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

// constants
import { ORG } from '../constants';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const useStyles = makeStyles(theme => ({
  avatar: {
    height: 220,
    width: 220,
  },
  buttonText: {
    textTransform: 'uppercase',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  close: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 50,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  info: {
    backgroundColor: '#FAB7B7',
  },
  infoIcon: {
    paddingRight: 5,
  },
  input: {
    marginBottom: 20,
    minWidth: 250,
  },
  label: {
    lineHeight: 5,
    marginRight: 10,
  },
  right: {
    textAlign: 'right',
  },
  small: {
    height: 30,
    width: 30,
  },
  select: {
    marginTop: theme.spacing(2),
    minWidth: 200,
    width: '100%',
  },
  textField: {
    width: '100%',
  },
}));

export default function Profile() {
  const classes = useStyles();
  const [thisUser, setUser] = useContext(UserProvider.context);
  const history = useHistory();
  const { id } = useParams();
  const ownProfile =
    thisUser && thisUser.personas
      ? thisUser.personas.some(persona => persona.uuid === id)
      : false; // returns true if the profile page belongs to the logged in user

  const { data: persona, loading: loadingPersona } = useGetPersona({
    id: id,
    resolve: persona => persona.data[0],
    queryParams: {
      include_images: 'avatar',
    },
  });

  const { mutate: updateUser } = usePutUser({
    id: thisUser ? thisUser.uuid : null,
  });

  const { mutate: updatePersona } = usePutPersona({
    id: id,
  });

  const { data: expertises } = useGetExpertises({
    resolve: res => res.data,
  });

  const [displayedPersona, setDisplayedPersona] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const handleEdit = () => {
    setEditMode(true);
  };
  const cancelEdit = () => {
    setEditMode(false);
  };

  const handleChange = event => {
    setExpertise(event.target.value);
  };

  const onSave = () => {
    if (
      name === displayedPersona.name &&
      bio === displayedPersona.bio &&
      expertise === displayedPersona.expertise
    ) {
      setEditMode(false);
      return;
    }
    let data = {
      name: name,
      bio: bio,
      expertises: expertise,
    };
    updatePersona(data)
      .then(resp => {
        let updated = resp.data;
        alert(`You've successfully updated your persona.`);
        setEditMode(false);
        setDisplayedPersona({ ...displayedPersona, ...updated });
        setName(updated.name);
        setBio(updated.bio);
        // const newExpertises = expertises.filter(exp => {
        //   return updated.expertises.map(e => {
        //     return e === exp.id ? exp.name : '';
        //   });
        // });
        setExpertise(updated.expertises);
        setPersonas(
          personas.map(persona =>
            persona.uuid === updated.uuid
              ? { ...persona, ...updated }
              : persona,
          ),
        );
        return;
      })
      .catch(err => alert(`An error occurred:`, err.message));
  };

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const handleAvatarClick = () => {
    setAvatarModalOpen(true);
  };

  const handleAvatarSave = updated => {
    setDisplayedPersona({ ...displayedPersona, avatar: updated.avatar });
    setUser({
      ...thisUser,
      defaultPersona: { ...displayedPersona, avatar: updated.avatar },
    });
    setAvatarModalOpen(false);
  };

  const [personas, setPersonas] = useState(
    !thisUser || !thisUser.personas ? [] : thisUser.personas,
  );

  const [name, setName] = useState('');
  const orcid = ownProfile
    ? thisUser.orcid
    : displayedPersona && !displayedPersona.isAnonymous
    ? displayedPersona.orcid
    : '';
  const [contacts, setContacts] = useState(
    ownProfile
      ? thisUser.contacts
      : displayedPersona && !displayedPersona.isAnonymous
      ? displayedPersona.contacts
      : [],
  );
  const badges =
    displayedPersona && displayedPersona.badges ? displayedPersona.badges : [];
  const communities =
    displayedPersona && displayedPersona.communities
      ? displayedPersona.communities
      : [];
  const works =
    displayedPersona && displayedPersona.works ? displayedPersona.works : [];
  const [bio, setBio] = useState(
    displayedPersona && displayedPersona.bio ? displayedPersona.bio : '',
  );

  const [expertise, setExpertise] = useState(
    displayedPersona && displayedPersona.expertises
      ? displayedPersona.expertises.reduce((a, o) => (a.push(o.name), a), [])
      : [],
  );

  const handlePersonaChange = e => {
    updateUser({ defaultPersona: e.target.value.uuid })
      .then(() => {
        alert(
          `You've successfully updated your active persona to ${
            e.target.value.name
          }.`,
        );
        setSelectedPersona(e.target.value);
        setDisplayedPersona(e.target.value);
        return;
      })
      .catch(err => alert(`An error occurred: ${err.message}`));
  };

  useEffect(() => {
    if (displayedPersona && ownProfile) {
      setName(displayedPersona.name);
      setBio(displayedPersona.bio ? displayedPersona.bio : '');
    }
    if (displayedPersona && !displayedPersona.isAnonymous) {
      setContacts(displayedPersona.contacts);
    }
  }, [displayedPersona]);

  useEffect(() => {
    setDisplayedPersona(persona);
  }, [persona]);

  useEffect(() => {
    if (
      ownProfile &&
      selectedPersona &&
      selectedPersona.uuid !== thisUser.defaultPersona.uuid
    ) {
      history.push(`/about/${selectedPersona.uuid}`);
      setUser({
        ...thisUser,
        defaultPersona: selectedPersona,
      });
    }
  }, [selectedPersona]);

  if (!displayedPersona) {
    return <Loading />;
  } else {
    return (
      <Box>
        <Helmet>
          <title>
            {displayedPersona.name} • {ORG}
          </title>
        </Helmet>

        <HeaderBar thisUser={thisUser} />

        <Box my={10}>
          <Container>
            {ownProfile ? (
              <Box my={4}>
                <Container>
                  {thisUser.contacts.length === 0 ? (
                    <Grid container alignItems="center" justify="space-between">
                      <Grid item>
                        <Box mb={4} p={2} className={classes.info}>
                          <Typography component="div" variant="body1">
                            <InfoOutlinedIcon className={classes.infoIcon} />
                            We were not able to import your email address from
                            your ORCID record.
                            <p>
                              In order to receive key notifications, e.g.,
                              updates to our Privacy Policy, notification of
                              activity on the platform in response to a review
                              request, or other platform changes, please add a
                              valid email address to your PREreview profile.{' '}
                            </p>
                            <p>
                              You can opt out of website notifications as well
                              as hide your email from the public. We will not
                              share your contact information.
                            </p>
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : null}
                  <Grid
                    component="label"
                    container
                    alignItems="center"
                    justify="space-between"
                    spacing={8}
                  >
                    <Grid
                      container
                      item
                      xs={12}
                      md={8}
                      alignItems="center"
                      justify="flex-start"
                      spacing={2}
                    >
                      <Grid item>
                        <Typography component="div" variant="body1">
                          Active persona:
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Select
                          value={
                            thisUser
                              ? personas.filter(
                                  p => p.uuid === thisUser.defaultPersona.uuid,
                                )[0]
                              : ''
                          }
                          onChange={handlePersonaChange}
                          className={classes.select}
                          renderValue={selected => (
                            <Grid
                              container
                              alignItems="center"
                              justify="flex-start"
                              spacing={2}
                            >
                              <Grid item>
                                <Avatar
                                  src={displayedPersona.avatar}
                                  alt={displayedPersona.name}
                                  className={classes.small}
                                >
                                  {displayedPersona.name.charAt(0)}
                                </Avatar>
                              </Grid>
                              <Grid item>
                                <span>
                                  {selected.isAnonymous
                                    ? `Anonymous persona`
                                    : `Public persona`}
                                </span>
                              </Grid>
                            </Grid>
                          )}
                        >
                          {personas
                            ? personas.map(p => {
                                return (
                                  <MenuItem key={p.uuid} value={p}>
                                    {p.isAnonymous
                                      ? `Anonymous persona: ${p.name}`
                                      : `Public persona: ${p.name}`}
                                  </MenuItem>
                                );
                              })
                            : null}
                        </Select>
                        <FormHelperText>
                          Choose the profile persona you wish to use as default
                          in your activity.
                        </FormHelperText>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={4} className={classes.right}>
                      {editMode ? (
                        <Grid container spacing={2} justify="flex-end">
                          <Grid item>
                            <Button
                              type="button"
                              onClick={onSave}
                              color="primary"
                              variant="contained"
                            >
                              <span className={classes.buttonText}>Save</span>
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button
                              type="button"
                              onClick={cancelEdit}
                              color="primary"
                              variant="outlined"
                            >
                              <span className={classes.buttonText}>Cancel</span>
                            </Button>
                          </Grid>
                        </Grid>
                      ) : (
                        <Button
                          onClick={handleEdit}
                          className={classes.buttonText}
                          color="primary"
                          variant="contained"
                        >
                          Edit profile
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </Container>
              </Box>
            ) : null}

            <Box my={8} pb={6} borderBottom="1px solid #C1BFBF">
              <Container>
                <Grid container justify="space-between" alignItems="flex-start">
                  <Grid item>
                    <Box>
                      {editMode && !displayedPersona.isAnonymous ? (
                        <TextField
                          className={classes.input}
                          required
                          id="name"
                          label="Name"
                          value={name}
                          onChange={e => {
                            setName(e.target.value);
                          }}
                          variant="outlined"
                        />
                      ) : (
                        <Typography component="div" variant="h6" gutterBottom>
                          {displayedPersona.name}
                        </Typography>
                      )}
                    </Box>
                    {!displayedPersona.isAnonymous && !editMode ? (
                      <>
                        <Box>
                          <Typography
                            component="div"
                            variant="body1"
                            gutterBottom
                          >
                            <Link href={`https://orcid.org/${orcid}`}>
                              <img
                                alt="ORCID logo"
                                src="https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png"
                                width="16"
                                height="16"
                              />{' '}
                              {orcid}
                            </Link>
                          </Typography>
                        </Box>
                        {contacts && contacts.length ? (
                          <Box>
                            <Typography
                              component="div"
                              variant="body1"
                              gutterBottom
                            >
                              <b className={editMode ? classes.label : ''}>
                                Contact information:{' '}
                              </b>
                              <List>
                                {contacts.map(contact => (
                                  <ListItem key={contact.uuid}>
                                    <a href={`mailto:${contact.value}`}>
                                      {contact.value}
                                    </a>
                                  </ListItem>
                                ))}
                              </List>
                            </Typography>
                          </Box>
                        ) : null}
                      </>
                    ) : null}
                    <Box>
                      <Typography component="div" variant="body1" gutterBottom>
                        <b>Badges: </b>
                        {badges && badges.length > 0
                          ? badges.map(badge => (
                              <Chip
                                key={badge.uuid}
                                label={badge.name}
                                color="primary"
                                size="small"
                              />
                            ))
                          : 'No badges yet.'}
                      </Typography>
                      {/*
                      <Typography component="div" variant="body1" gutterBottom>
                        <b>Area(s) of expertise: </b>
                        {editMode ? (
                          <Select
                            className={classes.input}
                            multiple
                            value={expertise}
                            onChange={handleChange}
                            input={<Input />}
                          >
                            {expertises.map(exp => (
                              <MenuItem key={exp.uuid} value={exp.uuid}>
                                {exp.name}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : expertise && expertise.length > 0 ? (
                          expertise.map(exp => (
                            <span key={exp.uuid}>{exp.name}, </span>
                          ))
                        ) : (
                          'No expertise selected yet.'
                        )}
                      </Typography>
                      */}
                      <Typography component="div" variant="body1" gutterBottom>
                        Community member since{' '}
                        {format(new Date(persona.createdAt), 'yyyy/MM/dd')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item>
                    {editMode && ownProfile ? (
                      <IconButton onClick={handleAvatarClick}>
                        <Avatar
                          src={displayedPersona.avatar}
                          alt={displayedPersona.name}
                          className={classes.avatar}
                        >
                          {displayedPersona.name.charAt(0)}
                        </Avatar>
                      </IconButton>
                    ) : (
                      <Avatar
                        src={displayedPersona.avatar}
                        alt={displayedPersona.name}
                        className={classes.avatar}
                      >
                        {displayedPersona.name.charAt(0)}
                      </Avatar>
                    )}
                  </Grid>
                </Grid>

                {editMode && avatarModalOpen ? (
                  <Dialog
                    aria-label="edit-avatar"
                    open={open}
                    onClose={() => {
                      setAvatarModalOpen(false);
                    }}
                  >
                    <IconButton
                      aria-label="close"
                      onClick={() => {
                        setAvatarModalOpen(false);
                      }}
                      className={classes.close}
                    >
                      <CloseIcon />
                    </IconButton>
                    <RoleEditor
                      persona={displayedPersona}
                      onCancel={() => {
                        setAvatarModalOpen(false);
                      }}
                      onSaved={handleAvatarSave}
                    />
                  </Dialog>
                ) : null}
                {displayedPersona.isAnonymous ? (
                  ''
                ) : (
                  <Typography component="div" variant="body1" gutterBottom>
                    <b>About</b>
                  </Typography>
                )}
                {editMode && !displayedPersona.isAnonymous ? (
                  <TextField
                    className={classes.textField}
                    multiline
                    rowsMax={24}
                    id="bio"
                    name="bio"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    variant="outlined"
                  />
                ) : (
                  <Typography component="div" variant="body1">
                    {displayedPersona.bio}
                  </Typography>
                )}
                {ownProfile && editMode && !displayedPersona.isAnonymous ? (
                  <Box mt={6}>
                    <SettingsNotifications user={thisUser} />
                  </Box>
                ) : null}
              </Container>
            </Box>

            {editMode ? null : (
              <Box>
                <Container>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography component="h5" variant="h5" gutterBottom>
                        {displayedPersona.name}&apos;s PREreview communities
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid>
                        {communities.length > 0 ? (
                          communities.map(community => {
                            return (
                              <Chip
                                key={community.uuid}
                                label={community.name}
                                variant="outlined"
                                href={`/communities/${community.slug}`}
                                component="a"
                                target="_blank"
                                clickable
                              />
                            );
                          })
                        ) : (
                          <Typography>
                            {displayedPersona.name} hasn't joined any PREreview
                            communities yet.
                          </Typography>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography component="h5" variant="h5" gutterBottom>
                        {displayedPersona.name}&apos;s PREreview contributions
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid>
                        <RoleActivity persona={displayedPersona} />
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                  {!displayedPersona.isAnonymous ? (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography component="h5" variant="h5" gutterBottom>
                          {displayedPersona.name}&apos;s publications
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid>
                          {works.length > 0 ? (
                            works.map(work => {
                              return <WorkCard work={work} key={work.uuid} />;
                            })
                          ) : (
                            <Typography>
                              {displayedPersona.name} has no publications on
                              their ORCID record.
                            </Typography>
                          )}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ) : null}
                </Container>
              </Box>
            )}
          </Container>
        </Box>
      </Box>
    );
  }
}
