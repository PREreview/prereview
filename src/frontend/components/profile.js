// base imports
import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import AvatarEditor from 'react-avatar-editor';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import {
  useGetPersona,
  usePutPersona,
  usePutUser,
  usePostUserContacts,
  usePutUserContacts,
} from '../hooks/api-hooks.tsx';

// Material UI components
import {
  ThemeProvider,
  makeStyles,
  withStyles,
  createMuiTheme,
} from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import Link from '@material-ui/core/Link';
import MenuItem from '@material-ui/core/MenuItem';
import MuiButton from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

// components
import HeaderBar from './header-bar';
import LabelStyle from './label-style';
import Loading from './loading.js';
//import NotFound from './not-found';
import RoleActivity from './role-activity';

// constants
import { ORG } from '../constants';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const EXAMPLE_EXPERTISE = ['Biology', 'Microbiology', 'Physics', 'COVID-19'];

const prereviewTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#F77463',
      contrastText: '#fff',
    },
    secondary: {
      main: '#eaeaf0',
    },
  },
  typography: {
    fontFamily: ['Open Sans', 'sans-serif'].join(','),
  },
});

const useStyles = makeStyles(theme => ({
  buttonText: {
    paddingLeft: 6,
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  avatar: {
    height: 220,
    width: 220,
  },
  small: {
    height: 30,
    width: 30,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function Profile() {
  const classes = useStyles();
  const [thisUser, setUser] = useContext(UserProvider.context);
  const { id } = useParams();
  const ownProfile = thisUser
    ? thisUser.personas.some(persona => persona.uuid === id)
    : false; // returns true if the profile page belongs to the logged in user

  const { data: persona, loading } = useGetPersona({
    id: id,
    resolve: persona => persona.data[0],
  });

  const { mutate: updateUser } = usePutUser({
    id: thisUser.uuid,
  });

  const { mutate: updatePersona, loadingUpdate, error } = usePutPersona({
    id: id,
  });

  const [selectedPersona, setSelectedPersona] = useState(
    thisUser ? thisUser.defaultPersona : {},
  );

  let [displayedPersona, setDisplayedPersona] = useState(
    ownProfile ? selectedPersona : !loading ? persona : {},
  );

  const [editMode, setEditMode] = useState(false);
  const handleEdit = () => {
    setEditMode(true);
  };
  const cancelEdit = () => {
    setEditMode(false);
  };

  const onSave = () => {
    if (name === displayedPersona.name && bio === displayedPersona.bio) {
      alert(`No changes were made.`)
      return;
    }
    let data = {
      name: name,
      bio: bio,
    };
    updatePersona(data)
      .then(resp => {
        let updated = resp.data;
        alert(`You've successfully updated your persona.`);
        setEditMode(false);
        setDisplayedPersona(updated);
        setName(updated.name)
        setBio(updated.bio)
      })
      .catch(err => alert(`ERROR!`, err.message));
  };

  const personas = !thisUser ? [] : thisUser.personas;

  const [name, setName] = useState(
    displayedPersona ? displayedPersona.name : '',
  );
  const orcid = ownProfile
    ? thisUser.orcid
    : displayedPersona && displayedPersona.identity
    ? displayedPersona.identity.orcid
    : '';
  const [contacts, setContacts] = useState(
    displayedPersona && !displayedPersona.isAnonymous
      ? displayedPersona.identity.contacts
      : [],
  );
  const [expertise, setExpertise] = useState([]);
  const badges =
    displayedPersona && displayedPersona.badges ? displayedPersona.badges : [];
  const [bio, setBio] = useState(
    displayedPersona && displayedPersona.bio ? displayedPersona.bio : null,
  );

  const handleChange = e => {
    updateUser({ defaultPersona: e.target.value.id })
      .then(() => {
        alert(`You've successfully updated your active persona.`);
        setSelectedPersona(e.target.value);
      })
      .catch(err => alert(`An error occurred: ${err.message}`));
  };

  useEffect(() => {
    setUser({ ...thisUser, defaultPersona: selectedPersona });
    setDisplayedPersona(selectedPersona);
  }, [selectedPersona]);

  if (!persona || loading) {
    return <Loading />;
  } else {
    return (
      <ThemeProvider theme={prereviewTheme}>
        <Helmet>
          <title>
            {displayedPersona.name} • {ORG}
          </title>
        </Helmet>

        {/* <HeaderBar thisUser={thisUser} closeGap /> */}

        <Box my={10}>
          <Container>
            {ownProfile ? (
              <Box textAlign="center">
                <Container>
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
                      md={6}
                      alignItems="center"
                      justify="flex-start"
                    >
                      <Grid item xs={4}>
                        <Typography component="div" variant="body1">
                          Active persona:
                        </Typography>
                      </Grid>
                      <Grid item md={10}>
                        <Select
                          value={selectedPersona}
                          onChange={handleChange}
                          className={classes.selectEmpty}
                          renderValue={selected => (
                            <><Avatar
                              src={selected.avatar}
                              className={classes.small}
                            />
                            <span>{selected.name}</span>
                            </>
                          )}
                        >
                          {personas
                            ? personas.map(p => {
                                return (
                                  <MenuItem key={p.uuid} value={p}>
                                    {p.name}
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
                    <Grid item xs={12} md={6}>
                      {editMode ? (
                        <>
                          <Button type="button" onClick={cancelEdit}>
                            <span className={classes.buttonText}>
                              Cancel edits
                            </span>
                          </Button>
                          <Button type="button" onClick={onSave}>
                            <span className={classes.buttonText}>
                              Save changes
                            </span>
                          </Button>
                        </>
                      ) : (
                        <Link onClick={handleEdit}>Edit profile</Link>
                      )}
                    </Grid>
                  </Grid>
                </Container>
              </Box>
            ) : null}

            <Box my={8} borderBottom="1px solid #C1BFBF">
              <Container>
                <Grid container justify="space-between" alignItems="flex-start">
                  <Grid item>
                    <Box>
                      {editMode && !displayedPersona.isAnonymous ? (
                        <TextField
                          required
                          id="name"
                          label="Name"
                          value={name}
                          onChange={e => {
                            setName(e.target.value);
                          }}
                        />
                      ) : (
                        <Typography component="div" variant="h6" gutterBottom>
                          {displayedPersona.name}
                        </Typography>
                      )}
                    </Box>
                    {!displayedPersona.isAnonymous ? (
                      <Box>
                        <Typography
                          component="div"
                          variant="body1"
                          gutterBottom
                        >
                          <Link href={`https://orcid.org/${orcid}`}>
                            ORCiD: {orcid}
                          </Link>
                        </Typography>
                        <Typography
                          component="div"
                          variant="body1"
                          gutterBottom
                        >
                          <b>Contact: </b>
                          <br />
                          {editMode ? (
                            contacts && contacts.length ? (
                              contacts.map(contact => (
                                <TextField
                                  required
                                  id="Email"
                                  label="Email"
                                  value={contact.value}
                                  onChange={handleEmailChange}
                                />
                              ))
                            ) : (
                              <TextField
                                required
                                id="email"
                                label="email"
                                value={''}
                                onChange={e => {
                                  console.log('email');
                                }}
                              />
                            )
                          ) : contacts.length ? (
                            contacts.map(contact => contact.value)
                          ) : ownProfile ? (
                            ` Please go to 'Edit profile' and add an email address!`
                          ) : (
                            `None provided.`
                          )}
                        </Typography>
                      </Box>
                    ) : null}
                    <Box>
                      <Typography component="div" variant="body1" gutterBottom>
                        <b>Badges: </b>
                      </Typography>
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
                      <Typography component="div" variant="body1" gutterBottom>
                        <b>Area(s) of expertise: </b>
                      </Typography>
                      {editMode ? (
                        <Select
                          multiple
                          value={expertise}
                          onChange={handleChange}
                          input={<Input />}
                        >
                          {EXAMPLE_EXPERTISE.map(exp => (
                            <MenuItem key={exp} value={exp}>
                              {exp}
                            </MenuItem>
                          ))}
                        </Select>
                      ) : (
                        `No area of expertise selected yet.`
                      )}
                      <Typography component="div" variant="body1" gutterBottom>
                        Community member since{' '}
                        {format(new Date(persona.createdAt), 'MMM. d, yyyy')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item>
                    {ownProfile ? (
                      <IconButton href="/settings">
                        <Avatar
                          src={displayedPersona.avatar}
                          className={classes.avatar}
                        />
                      </IconButton>
                    ) : (
                      <Avatar
                        src={displayedPersona.avatar}
                        className={classes.avatar}
                      />
                    )}
                  </Grid>
                </Grid>
                <Typography component="div" variant="body1" gutterBottom>
                  <b>About</b>
                </Typography>
                <br />
                {editMode && !displayedPersona.isAnonymous ? (
                  <TextField
                    multiline
                    rowsMax={24}
                    id="bio"
                    name="bio"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                  />
                ) : (
                  displayedPersona.bio
                )}
              </Container>
            </Box>

            {editMode ? null : (
              <Box>
                <Container>
                  <Typography component="h2" variant="h6" gutterBottom>
                    PREreview Communities
                  </Typography>
                  <Typography component="h2" variant="h6" gutterBottom>
                    PREreview Contributions
                  </Typography>
                  {!ownProfile ? (
                    <RoleActivity persona={displayedPersona} />
                  ) : null}
                  <Typography component="h2" variant="h6" gutterBottom>
                    List of Publications
                  </Typography>
                </Container>
              </Box>
            )}
          </Container>
        </Box>
      </ThemeProvider>
    );
  }
}
