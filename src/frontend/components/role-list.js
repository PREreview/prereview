// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// Material UI imports
import { makeStyles } from '@material-ui/core/styles';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Typography from '@material-ui/core/Typography';

// components
import RoleBadge from './role-badge';

const useStyles = makeStyles(() => ({
  avatar: {
    border: 'none',
  },
  list: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  listItem: {
    marginLeft: '-30px',
    height: 50,
    padding: 0,
    width: 50,
  },
}));

export default function Reviewers({
  user,
  allReviews,
  hasReviewed,
  preprintId,
}) {
  const classes = useStyles();
  const [reviews] = useState(allReviews);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    let newAuthors = [];
    reviews.map(review => {
      if (review.author) {
        const newAuthor = review.author;
        newAuthor.reviewUuid = preprintId
          ? `/preprints/${preprintId}/rapid-reviews/${review.uuid}`
          : `/rapid-reviews/${review.uuid}`;
        newAuthors = [...newAuthors, newAuthor];
      } else if (review.authors) {
        if (review.isPublished) {
          review.authors.map(author => {
            const newAuthor = author;
            newAuthor.reviewUuid = preprintId
              ? `/preprints/${preprintId}/full-reviews/${review.uuid}`
              : `/full-reviews/${review.uuid}`;
            newAuthors = [...newAuthors, newAuthor];
          });
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
        <Typography variant="body1" component="div" gutterBottom>
          None yet.
        </Typography>
      )}

      <AvatarGroup max={20} className={classes.list}>
        {authors.length
          ? authors.map(author => {
              return <RoleBadge key={author.uuid} user={author} />;
            })
          : null}
      </AvatarGroup>
    </>
  );
}

Reviewers.propTypes = {
  preprintId: PropTypes.string,
  user: PropTypes.object,
  allReviews: PropTypes.array.isRequired,
  roleIds: PropTypes.arrayOf(PropTypes.object),
  hasReviewed: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
    PropTypes.string,
  ]),
};
