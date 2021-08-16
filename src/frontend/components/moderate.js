// base imports
import React, { useContext, useEffect, useState } from 'react';
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
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Modal from '@material-ui/core/Modal';
import MuiButton from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

// icons
import Delete from '@material-ui/icons/Delete';
import LockRounded from '@material-ui/icons/LockRounded';
import LockOpenIcon from '@material-ui/icons/LockOpen';

// constants
import { ORG } from '../constants';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const useStyles = makeStyles(theme => ({
  avatar: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: theme.spacing(2),
  },
  modal: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    left: '50%',
    minWidth: 300,
    padding: theme.spacing(2, 4, 3),
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
}));

export default function Moderate() {
  const [user] = useContext(UserProvider.context);

  // get reports from API
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
          <header>
            <Box borderBottom="1px solid #ccc" pb={4} mb={4}>
              <Grid container justify="space-between" alignItems="center">
                <Grid item>
                  <Typography variant="h3" component="h1">
                    Moderate Content
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h5" component="h2">
                    {reports && reports.length ? reports.length : 'No'} Reports
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </header>

          {reports && reports.length ? (
            <ul className="moderate__card-list">
              {reports.map(report => (
                <li key={report.uuid}>
                  <ModerateCard report={report} />
                </li>
              ))}
            </ul>
          ) : (
            <div>No content on the site has been reported.</div>
          )}
        </section>
      </div>
    );
  }
}

function ModerateCard({ report }) {
  const classes = useStyles();
  const [isLocked, setIsLocked] = useState(false);

  const { data: reportedContent, loading, error } = useGetReported({
    id: report.subject,
    resolve: report => report.data,
  });

  const { mutate: lock } = usePutReport({
    id: report.uuid,
    isLocked: isLocked,
  });

  const { mutate: remove } = useDeleteReport({
    id: report.uuid,
  });

  useEffect(() => {
    if (!loading && reportedContent) {
      setIsLocked(reportedContent.isLocked);
    }
  }, [loading, reportedContent]);

  // unlock or lock a review to signed in moderator
  const onLock = () => {
    if (isLocked) {
      lock({ isLocked: false })
        .then(() => setIsLocked(false))
        .catch(err => alert(`Error locking report: ${err}`));
    } else {
      lock({ isLocked: true })
        .then(() => setIsLocked(true))
        .catch(err => alert(`Error locking report: ${err}`));
    }
  };

  // delete a review
  const onRemove = () => {
    remove()
      .then(() => {
        alert('Successfully removed report.');
        return;
      })
      .catch(err => {
        alert(`Error removing report: ${err}`);
      });
  };

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {}, [isLocked]);

  return (
    <Card className={classes.card}>
      <Grid container justify="space-between">
        <CardHeader
          className={classes.header}
          title={
            report.title
              ? report.title
              : `${report.subjectType}/${report.subject}`
          }
        />
        <CardContent className={classes.content}>
          <Grid container alignItems="center" spacing={1}>
            <Grid item>
              <Button onClick={handleOpen} color="primary" variant="outlined">
                Review
              </Button>
              <Modal open={open} onClose={handleClose}>
                <ModerateModal
                  report={report}
                  reportedContent={reportedContent}
                  onLock={onLock}
                  onRemove={onRemove}
                />
              </Modal>
            </Grid>
            <Grid item>
              <IconButton arial-label="lock" onClick={onLock}>
                {isLocked ? (
                  <LockRounded color="primary" />
                ) : (
                  <LockOpenIcon color="primary" />
                )}
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton arial-label="remove" onClick={onRemove}>
                <Delete color="primary" />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Grid>
    </Card>
  );
}

ModerateCard.propTypes = {
  report: PropTypes.object.isRequired,
};

function ModerateModal({ report, reportedContent, onRemove, onLock }) {
  const classes = useStyles();

  return (
    <Card className={classes.modal}>
      <Grid container>
        <CardHeader
          className={classes.header}
          title={
            report.title
              ? report.title
              : `${report.subjectType}/${report.subject}`
          }
        />
        <CardContent className={classes.content}>
          <Box mb={4}>
            <Typography variant="h6" component="h2">
              Reason
            </Typography>
            <Typography variant="body1" component="div">
              {report.reason ? report.reason : 'No reason reported.'}
            </Typography>
          </Box>
          {/* FIXME include either a link to reported content or display it somehow */}
          {/*<Box mb={4}>
            <Link
              href={`/${report.subjectType}/${report.subject}`}
              color="primary"
            >
              <Typography variant="body1" component="span">
                View Reported Content
              </Typography>
            </Link>
            <Typography variant="body1" component="h3">
              {reportedContent.title
                ? reportedContent.title
                : reportedContent.name}
            </Typography>
          </Box>*/}

          {/* FIXME what controls should go here?*/}
          {/*<Grid container spacing={1}>
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
          </Grid>*/}
        </CardContent>
      </Grid>
    </Card>
  );
}

ModerateModal.propTypes = {
  report: PropTypes.object.isRequired,
  reportedContent: PropTypes.object.isRequired,
  onRemove: PropTypes.func,
  onLock: PropTypes.func,
};
