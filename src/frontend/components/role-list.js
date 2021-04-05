// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';

// components
import RoleBadge from './role-badge';

const useStyles = makeStyles(() => ({
  list: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginLeft: 30,
  },
  listItem: {
    marginLeft: '-30px',
    height: 50,
    padding: 0,
    width: 50,
  },
}));

export default function RoleList({
  user,
  allReviews,
  onModerate,
  isModerationInProgress,
  hasReviewed,
}) {
  const classes = useStyles();
  const [reviews] = useState(allReviews);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    let newAuthors = [];
    reviews.map(review => {
      if (review.author) {
        newAuthors = [...newAuthors, review.author];
      } else if (review.authors) {
        if (review.isPublished) {
          review.authors.map(author => (newAuthors = [...newAuthors, author]));
        }
      }
      return newAuthors;
    });

    if (hasReviewed) {
      newAuthors = [...newAuthors, user];
    }

    const filteredAuthors = newAuthors.filter(
      (author, i, authors) =>
        i === authors.findIndex(a => a.uuid === author.uuid),
    );

    setAuthors(filteredAuthors);
  }, []);

  useEffect(() => {}), [authors];

  return (
    <>
      {!authors.length && (
        <Typography variant="body1" component="div">
          No reviewers.
        </Typography>
      )}

      <List className={classes.list}>
        {authors.length
          ? authors.map(author => {
              return (
                <ListItem key={author.uuid} className={classes.listItem}>
                  <RoleBadge user={author}>
                    {user && user.isAdmin && (
                      <div
                        disabled={isModerationInProgress || author.uuid}
                        onSelect={() => {
                          onModerate(author.uuid);
                        }}
                      >
                        Report Review
                      </div>
                    )}
                  </RoleBadge>
                </ListItem>
              );
            })
          : null}
      </List>
    </>
  );
}

RoleList.propTypes = {
  user: PropTypes.object,
  allReviews: PropTypes.array.isRequired,
  onModerate: PropTypes.func,
  isModerationInProgress: PropTypes.bool,
  onRemoved: PropTypes.func.isRequired,
  roleIds: PropTypes.arrayOf(PropTypes.object),
  hasReviewed: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
    PropTypes.string,
  ]),
};
