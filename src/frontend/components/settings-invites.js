// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// hooks
import {
  useGetUserNotifications,
  useGetFullReviews,
  usePostFullReviewInviteAccept,
  useDeleteFullReviewInvite,
} from '../hooks/api-hooks.tsx';

// MaterialUI components
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import CircularProgress from '@material-ui/core/CircularProgress';
import MuiButton from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

const Button = withStyles({
  root: {
    color: '#fff',
    textTransform: 'none',
  },
})(MuiButton);

const StyledTableRow = withStyles(theme => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const useStyles = makeStyles(theme => ({
  input: {
    marginBottom: '1rem',
    width: '100%',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    top: `50%`,
    left: `50%`,
    maxWidth: 750,
    padding: theme.spacing(2, 4, 3),
    position: 'absolute',
    transform: `translate(-50%, -50%)`,
    width: '80vw',
  },
  spinning: {
    color: '#ff3333',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  submit: {
    marginTop: '1rem',
  },
}));

function InviteRow({ invite, onRemove }) {
  const { mutate: acceptInvite } = usePostFullReviewInviteAccept({
    id: invite.preprint,
    role: invite.role,
    pid: invite.persona,
  });
  const { mutate: declineInvite } = useDeleteFullReviewInvite({
    id: invite.preprint,
    role: invite.role,
    pid: invite.persona,
  });

  const handleAcceptInvite = () => {
    acceptInvite()
      .then(() => {
        alert('Invite has been accepted.');
        onRemove(invite);
        return;
      })
      .catch(() => alert('Failed to accept the invitation.'));
  };

  const handleDeclineInvite = () => {
    declineInvite()
      .then(() => {
        alert('Invite has been declined.');
        onRemove(invite);
        return;
      })
      .catch(() => alert('Failed to decline the invitation.'));
  };

  return (
    <>
      <StyledTableRow>
        <TableCell component="th" scope="row">
          {invite.title}
        </TableCell>
        <TableCell align="right">
          <Button
            color="primary"
            variant="contained"
            onClick={handleAcceptInvite}
          >
            Accept
          </Button>
        </TableCell>
        <TableCell align="right">
          <Button
            color="primary"
            variant="contained"
            onClick={handleDeclineInvite}
          >
            Delete
          </Button>
        </TableCell>
      </StyledTableRow>
    </>
  );
}

InviteRow.propTypes = {
  invite: PropTypes.object,
  onRemove: PropTypes.func.isRequired,
};

export default function SettingsInvites({ user }) {
  const classes = useStyles();

  // fetch all invites from the API
  const [invites, setInvites] = useState(null);
  const [reviews, setReviews] = useState(null);
  const {
    data: invitesData,
    loading: invitesLoading,
  } = useGetUserNotifications({
    uid: user.orcid,
    resolve: invites => invites.data,
  });
  const { data: reviewsData, loading: reviewsLoading } = useGetFullReviews({
    queryParams: {
      can_edit: user.personas.map(persona => persona.uuid).toString(),
      is_published: false,
    },
    resolve: reviews => reviews.data,
  });

  useEffect(() => {
    if (!invitesLoading) {
      if (invitesData) {
        setInvites(invitesData);
      }
    }
  }, [invitesLoading]);

  useEffect(() => {
    if (!reviewsLoading) {
      if (reviewsData) {
        setReviews(reviewsData);
      }
    }
  }, [invitesLoading]);

  const onRemove = remove => {
    const filtered = invites.filter(
      invite =>
        invite.preprint !== remove.preprint &&
        invite.persona !== remove.persona,
    );
    setInvites(filtered);
  };

  if (invitesLoading) {
    return <CircularProgress className={classes.spinning} />;
  } else {
    return (
      <>
        <Typography component="h2" variant="h2">
          Collaboration
        </Typography>

        <Box mt={4}>
          <Typography component="h3" variant="h3">
            Invites
          </Typography>
          {invites && invites.length ? (
            <TableContainer>
              <Table className={classes.table} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <TableCell className="vh">Name</TableCell>
                    <TableCell className="vh">Accept</TableCell>
                    <TableCell className="vh">Deny</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invites.map(invite => (
                    <InviteRow
                      key={invite.uuid}
                      invite={invite}
                      onRemove={onRemove}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography component="div" variant="body1">
              No invites yet.
            </Typography>
          )}
        </Box>

        <Box mt={4}>
          <Typography component="h3" variant="h3">
            Drafts
          </Typography>
          {reviews && reviews.length ? (
            <TableContainer>
              <Table className={classes.table} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <TableCell className="vh">Title</TableCell>
                    <TableCell className="vh">Handle</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviews.map(review => (
                    <StyledTableRow key={review.uuid}>
                      <TableCell component="th" scope="row">
                        <Link
                          href={`/preprints/${review.preprint.uuid}/reviews/${
                            review.uuid
                          }`}
                        >
                          {review.preprint.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/preprints/${review.preprint.uuid}/reviews/${
                            review.uuid
                          }`}
                        >
                          {review.preprint.handle}
                        </Link>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography component="div" variant="body1">
              No accepted invites to display.
            </Typography>
          )}
        </Box>
      </>
    );
  }
}

SettingsInvites.propTypes = {
  user: PropTypes.object.isRequired,
};
