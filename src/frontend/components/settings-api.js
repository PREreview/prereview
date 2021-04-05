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
import SettingsKeys from './settings-keys';

// constants
import { ORG } from '../constants';

export default function SettingsAPI() {
  const [user] = useContext(UserProvider.context);

  useEffect(() => {}, [user]);

  return (
    <Box>
      <Helmet>
        <title>Settings • {ORG}</title>
      </Helmet>

      <HeaderBar thisUser={user} />

      <Container>
        <Box my={4}>
          <SettingsKeys user={user} />
        </Box>
      </Container>
    </Box>
  );
}
