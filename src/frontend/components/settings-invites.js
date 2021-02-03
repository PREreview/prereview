// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useHistory } from 'react-router-dom';

// hooks
import { useGetInvites } from '../hooks/api-hooks.tsx';

// MaterialUI components
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Modal from '@material-ui/core/Modal';
import MuiButton from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// icons
import { MdInfoOutline } from 'react-icons/md';

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

export default function SettingsInvites({ user }) {
  const classes = useStyles();

  // fetch all invites from the API
  const [invites, setInvites] = useState(null);
  // FIXME this needs correct API hook
  // const { data: invitesData, loading: loading, error } = useGetInvites();

  // FIXME this is placeholder
  const loading = false;
  const invitesData = { data: [{ name: 'Test invite' }] };

  const handleAcceptInvite = invite => {
    console.log(invite);
    // FIXME build function
  };

  const handleDeleteInvite = invite => {
    alert("Invite has been accepted.")
    // FIXME build function
  };

  useEffect(() => {
    if (!loading) {
      if (invitesData) {
        setInvites(invitesData.data);
      }
    }
  }, [loading]);

  if (loading) {
    return <CircularProgress className={classes.spinning} />;
  } else {
    return (
      <section className="settings-notifications settings__section">
        <h3 className="settings__title">Collaboration</h3>
        <h4 className="settings__subtitle">Invites</h4>
        {invites && invites.length ? (
          <Box my={4}>
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
                    <StyledTableRow
                      key={invite.uuid ? invite.uuid : invite.title}
                    >
                      <TableCell component="th" scope="row">
                        {invite.name}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={() => handleAcceptInvite(invite)}
                        >
                          Accept
                        </Button>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={() => handleDeleteInvite(invite)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <div>No invites yet.</div>
        )}
        <h4 className="settings__subtitle">Accepted</h4>
        {/* FIXME build this section*/}
        <div>No accepted invites to display.</div>
      </section>
    );
  }
}

SettingsInvites.propTypes = {
  user: PropTypes.object.isRequired,
};
