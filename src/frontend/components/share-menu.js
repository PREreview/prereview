// base imports
import React, { useState } from 'react';
import copy from 'clipboard-copy';

// material UI
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';

// icons
import ShareIcon from '@material-ui/icons/Share';

const useStyles = makeStyles(theme => ({
  popoverInner: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
  },
}));

export default function ShareMenu() {
  const classes = useStyles();

  const [permalinkText, setPermalinkText] = useState('Copy permalink');

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setPermalinkText('Copy permalink');
  };

  const open = Boolean(anchorEl);
  const id = open ? 'share-menu' : undefined;

  const handleCopy = () => {
    copy(window.location.href);
    setPermalinkText('Copied');
  };

  return (
    <>
      <IconButton aria-describedby={id} onClick={handleClick}>
        <Typography variant="srOnly">Share</Typography>
        <ShareIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        className={classes.popover}
      >
        <div className={classes.popoverInner}>
          <Button onClick={handleCopy}>{permalinkText}</Button>

          {/* <Link
            download="rapid-prereview-data.jsonld"
            href={`/api/v2/preprint/${unprefix(
              createPreprintId(identifier),
            )}`}
            to={`/api/v2/preprint/${unprefix(createPreprintId(identifier))}`}
          >
            Download data (JSON-LD)
          </Link> */}
        </div>
      </Popover>
    </>
  );
}
