// base imports
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';

// Material UI imports
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import MuiButton from '@material-ui/core/Button';
import Popper from '@material-ui/core/Popper';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';

// hooks
import { usePostComments } from '../hooks/api-hooks.tsx';

// components
import CommentEditor from './comment-editor';
import Controls from './controls';
import ReportButton from './report-button';
import RoleBadge from './role-badge';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const LongformReviewReader = props => {
  const { height, review, user } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const useStyles = makeStyles(() => ({
    authors: {
      fontSize: '1.25rem',
      fontWeight: '600',
      justifyContent: 'flex-start',
      lineHeight: 1.3,
    },
    author: {
      '&:not(:last-child)': {
        '&:after': {
          content: '", "',
        },
      },
    },
    badge: {
      '&:not(:first-child)': {
        marginLeft: '-10px',
      },
    },
    date: {
      fontSize: '1rem',
    },
    h2: {
      fontSize: '1.2rem',
      fontWeight: '600',
    },
    popper: {
      backgroundColor: '#fff',
      bottom: '0 !important',
      left: 'unset !important',
      overflowY: 'scroll',
      position: 'fixed !important',
      right: 0,
      top: height ? `${height + 42}px !important` : 0,
      transform: 'none !important',
      width: '40vw',
      zIndex: '10000',
    },
    popperContent: {
      padding: 20,
    },
    yellow: {
      backgroundColor: '#FFFAEE',
      padding: 10,
    },
  }));

  const classes = useStyles();

  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? review.id : undefined;
  const reviewDate = new Date(review.updatedAt);
  const reviewContent = review.drafts[review.drafts.length - 1];

  // react html parser functionality
  const transform = node => {
    if (node.attribs) {
      if (node.attribs.class === 'ql-editor') {
        node.attribs.class = '';
        node.attribs.contenteditable = false;
      } else if (
        node.attribs.class === 'ql-clipboard' ||
        node.attribs.class === 'ql-tooltip ql-hidden'
      ) {
        return null;
      }
    }
    return convertNodeToElement(node);
  };

  // react html parser options
  const options = {
    decodeEntities: true,
    transform,
  };

  // comments
  const [content, setContent] = useState('');
  const [commentTitle, setCommentTitle] = useState('');
  const [publishedComment, setPublishedComment] = useState('');
  const [publishedTitle, setPublishedTitle] = useState('');

  const {
    mutate: postComment,
    loadingPostComment,
    errorPostComment,
  } = usePostComments();

  const handleCommentChange = value => {
    setContent(value);
  };

  const handleSubmitComment = (title, content) => {
    setPublishedTitle(title);
    setPublishedComment(content);
    setCommentTitle('');
    setContent('');
  };

  const canSubmit = content => {
    return content && content !== '<p></p>';
  };

  useEffect(() => {}, [content, commentTitle, publishedComment]);

  return (
    <div>
      <Button
        aria-describedby={id}
        type="button"
        onClick={handleClick}
        color="secondary"
      >
        Comment
      </Button>
      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        transition
        className={classes.popper}
      >
        {({ TransitionProps }) => (
          <Slide
            direction="left"
            mountOnEnter
            unmountOnExit
            timeout={350}
            {...TransitionProps}
          >
            <div className="review-reader-longform">
              <Button
                aria-describedby={id}
                type="button"
                onClick={handleClick}
                color="secondary"
              >
                Back
              </Button>
              <div className={classes.popperContent}>
                <Grid container justify="space-between" alignItems="center">
                  {review.authors.length > 1 ? (
                    <Grid
                      container
                      item
                      justify="flex-start"
                      alignItems="center"
                      spacing={2}
                      xs={12}
                      sm={9}
                    >
                      <Grid container item xs={12} sm={4}>
                        {review.authors.map(author => (
                          <div key={author.id} className={classes.badge}>
                            <RoleBadge user={author} />
                          </div>
                        ))}
                      </Grid>
                      <Grid item xs={12} sm={8} className={classes.authors}>
                        Review by{' '}
                        {review.authors.map(author => (
                          <span key={author.id} className={classes.author}>
                            {author.name}
                          </span>
                        ))}
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid
                      container
                      item
                      justify="flex-start"
                      alignItems="center"
                      spacing={2}
                      xs={12}
                      sm={9}
                    >
                      <Grid item>
                        <RoleBadge user={review.authors[0]} />
                      </Grid>
                      <Grid className={classes.authors}>{`${
                        review.authors[0].name
                      }'s review`}</Grid>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={3} className={classes.date}>
                    {reviewDate.toLocaleDateString('en-US')}
                  </Grid>
                </Grid>
                <Box border="1px solid #E5E5E5" mt={4} px={3} pb={2}>
                  <Box>{ReactHtmlParser(reviewContent.contents, options)}</Box>
                  <Grid
                    container
                    alignItems="center"
                    justify="space-between"
                    spacing={2}
                  >
                    <Grid item>Plaudit</Grid>
                    {/*#FIXME plaudits*/}
                    <Grid item>
                      <ReportButton reviewId={review.id} />
                    </Grid>
                  </Grid>
                </Box>
                <Box my={4} pb={1} borderBottom="5px solid #EBE9E9">
                  <Typography component="p" className={classes.h2}>
                    Comments
                  </Typography>
                </Box>
                {review.comments ? (
                  review.comments.map(comment => {
                    return (
                      <div key={comment.id}>
                        {comment.title ? (
                          <div className="comments-title">{comment.title}</div>
                        ) : null}
                        <div>
                          <em>{comment.author.name}</em>
                        </div>
                        <div>{ReactHtmlParser(comment.contents, options)}</div>
                      </div>
                    );
                  })
                ) : publishedComment ? (
                  <div key={`comment-${user.id}`}>
                    <div>
                      <em>{user.name}</em>
                    </div>
                    <div>{ReactHtmlParser(publishedComment, options)}</div>
                  </div>
                ) : (
                  <Typography>No comments have been added yet.</Typography>
                )}
                {publishedComment ? (
                  <div>
                    {commentTitle ? (
                      <div className="comments-title">{publishedTitle}</div>
                    ) : null}
                    <div>
                      <em>{user.name}</em>
                    </div>
                    <div>{ReactHtmlParser(publishedComment, options)}</div>
                  </div>
                ) : null}
                {user ? (
                  <Box mt={2} mb={2} className={classes.yellow}>
                    <form className="comments__add">
                      <CommentEditor
                        reviewId={review.id}
                        initialContent={content}
                        handleContentChange={handleCommentChange}
                      />
                      <Controls error={errorPostComment}>
                        <Button
                          type="submit"
                          primary="true"
                          disabled={!canSubmit(content)}
                          onClick={event => {
                            event.preventDefault();
                            if (canSubmit(content)) {
                              postComment({
                                title: `User ${user.id} comment`,
                                // #FIXME optional title needed
                                contents: content,
                              })
                                .then(() => {
                                  alert('Comment submitted successfully.');
                                  return handleSubmitComment(
                                    commentTitle,
                                    content,
                                  );
                                })
                                .catch(err =>
                                  alert(`An error occurred: ${err.message}`),
                                );
                            } else {
                              alert('Comment cannot be blank.');
                            }
                          }}
                        >
                          Comment
                        </Button>
                      </Controls>
                    </form>
                  </Box>
                ) : (
                  <Box mt={4} mb={2} className={classes.yellow}>
                    <Typography component="p">
                      Login to post a comment.
                    </Typography>
                  </Box>
                )}
              </div>
            </div>
          </Slide>
        )}
      </Popper>
    </div>
  );
};

LongformReviewReader.propTypes = {
  height: PropTypes.number,
  review: PropTypes.object.isRequired,
  user: PropTypes.object,
};

export default LongformReviewReader;
