// base imports
import React from 'react';
import PropTypes from 'prop-types';

// material UI imports
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  banner: {
    background: 'rgba(255, 255, 255, 0.85)',
    maxWidth: theme.breakpoints.values['lg'],
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4),
    padding: theme.spacing(4),
  },
  container: {
    marginTop: '3rem',
    padding: 0,
  },
  link: {
    display: 'block',
    color: '#000 !important',
    textDecoration: 'none !important',
    transform: 'scale(1)',
    transition: 'transform 500ms',
    '&:active, &:focus, &:hover': {
      textDecoration: 'none !important',
      transform: 'scale(1.1)',
      transition: 'transform 500ms',
    },
  },
}));

const CommunityCard = ({ community }) => {
  const classes = useStyles();

  const membersLimit = 10;

  return (
    <Link
      href={`/communities/${community.slug}`}
      key={community.uuid}
      className={classes.link}
    >
      <Container
        className={classes.container}
        style={
          community.banner
            ? {
                backgroundImage: `url(${community.banner})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
              }
            : { backgroundColor: 'rgba(229, 229, 229, 0.35)' }
        }
      >
        <Box className={classes.banner}>
          <Typography variant="h3" component="h2" gutterBottom={true}>
            {community.name}
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <AvatarGroup max={membersLimit}>
                {community.members.map(member => (
                  <Avatar
                    key={member.uuid}
                    alt={member.name}
                    src={member.avatar}
                  />
                ))}
              </AvatarGroup>
            </Grid>
            <Grid item>
              <Typography variant="h6" component="p" gutterBottom={true}>
                {community.members.length} Members
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="h5" color="textSecondary" paragraph>
            {community.description}
          </Typography>
        </Box>
      </Container>
    </Link>
  );
};

CommunityCard.propTypes = {
  community: PropTypes.object.isRequired,
};

export default CommunityCard;
