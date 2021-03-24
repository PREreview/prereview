// base imports
import React, { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

// contexts
import UserProvider from '../contexts/user-context';

// Material UI components
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

// components
import HeaderBar from './header-bar';
import SettingsApi from './settings-keys';
import SettingsInvites from './settings-invites';
import SettingsTemplates from './settings-templates';

// constants
import { ORG } from '../constants';

export default function Settings() {
  const [user] = useContext(UserProvider.context);

  useEffect(() => {}, [user]);

  return (
    <Box>
      <Helmet>
        <title>Settings • {ORG}</title>
      </Helmet>

      <HeaderBar thisUser={user} />

      <Container>
        <SettingsInvites user={user} />
        <SettingsApi user={user} />

        {user.isAdmin ? <SettingsTemplates /> : null}
      </Container>
    </Box>
  );
}
