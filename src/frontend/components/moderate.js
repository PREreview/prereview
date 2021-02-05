// base imports
import React, { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import {
  useGetReports,
  useGetReported,
  usePutReport,
  useDeleteReport,
} from '../hooks/api-hooks.tsx';

// components
import HeaderBar from './header-bar';
import Loading from './loading';
import NotFound from './not-found';

// Material UI components
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Delete from '@material-ui/icons/Delete';
import LockRounded from '@material-ui/icons/LockRounded';
import { makeStyles } from '@material-ui/core/styles';

// constants
import { ORG } from '../constants';

const useStyles = makeStyles(theme => ({
  card: {},
  header: {},
  content: {},
  avatar: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: theme.spacing(2),
  },
}));

export default function Moderate() {
  const [user] = useContext(UserProvider.context);

  const { data: reports, loading, error } = useGetReports({
    resolve: reports => reports.data,
  });

  if (loading) {
    return <Loading />;
  } else if (error) {
    return <NotFound />;
  } else {
    return (
      <div className="moderate">
        <Helmet>
          <title>Moderate Reviews • {ORG}</title>
        </Helmet>
        <HeaderBar thisUser={user} closeGap />

        <section>
          <header className="moderate__header">
            <span>Moderate Content</span>
            <span>
              {reports && reports.length ? reports.length : 'No'} Reports
            </span>
          </header>

          {reports && reports.length ? (
            <ul className="moderate__card-list">
              {reports.map(report => (
                <li key={report.uuid}>
                  <ModerateCard
                    id={report.uuid}
                    subject={report.subject}
                    type={report.subjectType}
                    reason={report.reason}
                    onRemove={() => console.log('onRemove')}
                    onLock={() => console.log('onLock')}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div>No reported reviews.</div>
          )}
        </section>
      </div>
    );
  }
}

function ModerateCard({ id, subject, type, reason, onRemove, onLock }) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <Grid container>
        <CardHeader className={classes.header} title={`${type}/${subject}`} />
        <CardContent className={classes.content}>
          <Grid container>
            <Grid item>
              <dt>
                <Typography>Reason</Typography>
              </dt>
              <dd>{reason}</dd>
            </Grid>
            <Grid item>
              <IconButton arial-label="lock" onClick={onLock}>
                <LockRounded />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton arial-label="remove" onClick={onRemove}>
                <Delete />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Grid>
    </Card>
  );
}

ModerateCard.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string,
  reason: PropTypes.string,
  onRemove: PropTypes.func,
  onLock: PropTypes.func,
  author: PropTypes.shape({
    name: PropTypes.string,
    uuid: PropTypes.string,
  }),
};

function ModerateModal({ id, subject, type, reason, onRemove, onLock }) {
  const classes = useStyles();

  const { data: report, loading, error } = useGetReported({
    id: subject,
    resolve: report => report.data,
  });

  const { mutate: lock } = usePutReport({
    id: id,
    isLocked: true,
  });

  const { mutate: remove } = useDeleteReport({
    id: id,
  });

  const handleLock = () => {
    lock()
      .then(() => {
        alert(`Successfully locked ${type}`);
        onLock(id);
        return;
      })
      .catch(() => {
        alert(`Error locking ${type}`);
      });
  };

  const handleRemove = () => {
    remove()
      .then(() => {
        alert('Successfully removed report');
        onLock(id);
        return;
      })
      .catch(() => {
        alert('Error removing report');
      });
  };

  if (loading) {
    return <Loading />;
  } else if (error) {
    return <NotFound />;
  } else {
    return (
      <Card className={classes.card}>
        <Grid container>
          <CardHeader className={classes.header} title={`${type}/${subject}`} />
          <CardContent className={classes.content}>
            <Grid container>
              <Grid item>
                <dt>
                  <Typography>Reason</Typography>
                </dt>
                <dd>{reason}</dd>
              </Grid>
              <Grid item>
                <IconButton arial-label="lock" onClick={handleLock}>
                  <LockRounded />
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton arial-label="remove" onClick={handleRemove}>
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          </CardContent>
        </Grid>
      </Card>
    );
  }
}

ModerateModal.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string,
  reason: PropTypes.string,
  onRemove: PropTypes.func,
  onLock: PropTypes.func,
  author: PropTypes.shape({
    name: PropTypes.string,
    uuid: PropTypes.string,
  }),
};
