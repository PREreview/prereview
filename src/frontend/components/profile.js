// base imports
import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useHistory, useParams } from 'react-router-dom';
import { format } from 'date-fns';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetPersona, usePutUser } from '../hooks/api-hooks.tsx';

// Material UI components
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import MenuItem from '@material-ui/core/MenuItem';
import Modal from '@material-ui/core/Modal';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';

// components
import HeaderBar from './header-bar';
import LabelStyle from './label-style';
import Loading from './loading.js';
//import NotFound from './not-found';
import RoleActivity from './role-activity';
//import RoleEditor from './role-editor';
import XLink from './xlink';

// constants
import { ORG } from '../constants';

const useStyles = makeStyles(theme => ({
  avatar: {
    height: 220,
    width: 220,
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
  // const [editAvatar, setEditAvatar] = useState(false);
  const { id } = useParams();
  const history = useHistory();
  const ownProfile = thisUser
    ? thisUser.personas.some(persona => persona.uuid === id)
    : false; // returns true if the profile page belongs to the logged in user

  const { data: persona, loading, error } = useGetPersona({
    id: id,
    resolve: persona => persona.data[0],
  });

  const { mutate: updateUser, loadingUser } = usePutUser({
    id: thisUser.uuid,
  });

  const personas = !thisUser ? [] : thisUser.personas;

  const [selectedPersona, setSelectedPersona] = useState(
    thisUser ? thisUser.defaultPersona : {},
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
  }, [selectedPersona]);

  if (!persona || loading) {
    return <Loading />;
  } else {
    return (
      <>
        <Helmet>
          <title>
            {persona.name} • {ORG}
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
                          renderValue={selected => selected.name}
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
                      <XLink to={`/settings`} href={`/settings`}>
                        Edit user settings
                      </XLink>
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
                      <Typography component="div" variant="h6" gutterBottom>
                        {persona.name}
                      </Typography>
                    </Box>
                    {!persona.isAnonymous && (
                      <Box>
                        <Typography
                          component="div"
                          variant="body1"
                          gutterBottom
                        >
                          <Link
                            href={`https://orcid.org/${persona.identity.orcid}`}
                          >
                            ORCiD: {persona.identity.orcid}
                          </Link>
                        </Typography>
                        <Typography
                          component="div"
                          variant="body1"
                          gutterBottom
                        >
                          <b>Email address: </b>
                          {persona.email ? persona.email : `None provided`}
                        </Typography>
                        <Typography
                          component="div"
                          variant="body1"
                          gutterBottom
                        >
                          <b>Badges: </b>
                          {persona.badges &&
                            persona.badges.length > 0 &&
                            persona.badges.map(badge => (
                              <Chip
                                key={badge.uuid}
                                label={badge.name}
                                color="primary"
                                size="small"
                              />
                            ))}
                        </Typography>
                        <Typography
                          component="div"
                          variant="body1"
                          gutterBottom
                        >
                          <b>Area(s) of expertise: </b>
                        </Typography>
                        <Typography
                          component="div"
                          variant="body1"
                          gutterBottom
                        >
                          Community member since{' '}
                          {format(new Date(persona.createdAt), 'MMM. d, yyyy')}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                  <Grid item>
                    {ownProfile ? (
                      <IconButton href="/settings">
                        <Avatar
                          src={persona.avatar}
                          className={classes.avatar}
                        />
                      </IconButton>
                    ) : (
                      <Avatar src={persona.avatar} className={classes.avatar} />
                    )}
                    {persona.badges && persona.badges.length > 0 && (
                      <Box>
                        <Typography component="div" variant="button">
                          Badges
                        </Typography>
                        {persona.badges.map(badge => (
                          <Chip
                            key={badge.uuid}
                            label={badge.name}
                            color="primary"
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  </Grid>
                </Grid>
                <Typography component="div" variant="body1" gutterBottom>
                  <b>About</b>
                  <br />
                  {persona.bio}
                </Typography>
              </Container>
            </Box>

            <Box>
              <Container>
                <Typography component="h2" variant="h6" gutterBottom>
                  PREreview Communities
                </Typography>
                <Typography component="h2" variant="h6" gutterBottom>
                  PREreview Contributions
                </Typography>
                {/* <RoleActivity persona={persona} /> */}
                <Typography component="h2" variant="h6" gutterBottom>
                  List of Publications
                </Typography>
              </Container>
            </Box>
          </Container>
        </Box>
      </>
    );
  }
}
