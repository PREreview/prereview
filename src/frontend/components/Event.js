// base imports
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetEvent } from '../hooks/api-hooks.tsx';

// components
import HeaderBar from './header-bar';
import Loading from './loading';
import NotFound from './not-found';

// Material-ui components
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

// constants
import { ORG } from '../constants';

const Event = () => {
  const intl = useIntl();
  const [user] = useContext(UserProvider.context);
  const { id } = useParams();
  const [evt, setEvt] = useState(null);
  const { data: eventData, loading, error } = useGetEvent({
    id: id,
  });

  useEffect(() => {
    if (!loading) {
      if (eventData) {
        setEvt(eventData.data[0]);
      }
    }
  }, [loading, eventData]);

  if (loading) {
    return <Loading />;
  } else if (error) {
    return <NotFound />;
  } else {
    return (
      <div>
        <Helmet>
          <title>
            {evt ? evt.title : ''} • {ORG}
          </title>
        </Helmet>

        <HeaderBar thisUser={user} />

        <Container maxWidth="md">
          <Box mt={12}>
            <Typography variant="h3" component="h1" gutterBottom>
              {evt ? evt.title : ''}
            </Typography>
            <Typography variant="body1" paragraph gutterBottom>
              {evt
                ? new Intl.DateTimeFormat(intl.locale, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  }).format(Date.parse(evt.start))
                : ''}
            </Typography>
            {evt && evt.url && (
              <Typography variant="body1" component="div">
                <Link href={evt.url}>{evt.url}</Link>
              </Typography>
            )}
            <Typography variant="body1" component="div">
              {evt ? evt.description : ''}
            </Typography>
          </Box>
        </Container>
      </div>
    );
  }
};

export default Event;
