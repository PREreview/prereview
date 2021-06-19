// base imports
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import { useHistory, useLocation } from 'react-router-dom';

// hooks
import { useGetCommunities } from '../hooks/api-hooks.tsx';

// material UI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Link from '@material-ui/core/Link';
import MenuItem from '@material-ui/core/MenuItem';
import MuiButton from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';

// utils
import { getYesNoStats } from '../utils/stats';

// components
import Barplot from './barplot';
import Loading from './loading';
import LongformReviewReader from './review-reader-longform';
import NotFound from './not-found';
import RapidReviewReader from './review-reader-rapid';
import Reviewers from './role-list';
import ReportButton from './report-button';
import ShareMenu from './share-menu';
import TextAnswers from './text-answers';

const Button = withStyles({
  root: {
    textTransform: 'none',
  },
})(MuiButton);

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
  },
  accordion: {
    borderLeft: '5px solid #EBE9E9',
    boxShadow: 'none',
  },
  date: {
    flexBasis: '25%',
    flexShrink: 1,
  },
  link: {
    paddingBottom: 5,
    paddingLeft: 2,
  },
  spacing: {
    lineHeight: 1.5,
  },
  vh: {
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: 1,
  },
}));

const AccordionSummary = withStyles({
  expandIcon: {
    color: '#1472E3',
    fontSize: '0.85rem',

    '&.Mui-expanded': {
      transform: 'none',
    },
  },
})(MuiAccordionSummary);

export default function ReviewReader({
  user,
  role,
  preprint,
  defaultHighlightedRoleIds,
  onHighlighedRoleIdsChange = noop,
  isModerationInProgress,
  onModerate,
  rapidContent,
  longContent,
  newRequest,
  height,
  isReader = true,
}) {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  const [content, setContent] = useState('');
  const [commentTitle, setCommentTitle] = useState('');
  const [publishedTitle, setPublishedTitle] = useState('');
  const [publishedComment, setPublishedComment] = useState('');
  const [publishedReviews, setPublishedReviews] = useState(
    preprint.fullReviews.filter(review => review.isPublished),
  );
  const [filteredReviews, setFilteredReviews] = useState(allReviews);
  const [filteredRapid, setFilteredRapid] = useState(allRapidReviews);
  const [filteredPublished, setFilteredPublished] = useState(publishedReviews);
  const [allRapidReviews, setAllRapidReviews] = useState(preprint.rapidReviews);
  const [allReviews] = useState(publishedReviews.concat(allRapidReviews));

  const [expandRapid, setExpandRapid] = useState(true);
  const [expandLong, setExpandLong] = useState(true);

  // communities filter integration
  const [communities, setCommunities] = useState(null);
  const [selectedCommunities, setSelectedCommunities] = useState([]);

  const {
    data: communitiesData,
    loading: loadingCommunities,
    error: communityError,
  } = useGetCommunities({
    resolve: communities => {
      if (communities.data && Array.isArray(communities.data)) {
        return communities.data;
      }
    },
  });

  // expand and collapse rapid and full review sections
  const handleChangeRapid = panel => (event, newExpanded) => {
    setExpandRapid(newExpanded ? panel : false);
  };

  const handleChangeLong = panel => (event, newExpanded) => {
    setExpandLong(newExpanded ? panel : false);
  };

  // comment methods for the longform review reader to persist to
  const handleCommentChange = value => {
    setContent(value);
  };

  const handleCommentSubmit = (title, content) => {
    setPublishedTitle(title);
    setPublishedComment(content);
    setCommentTitle('');
    setContent('');
    const quill = document.getElementsByClassName('ql-editor');
    quill[0].innerHTML = '';
  };

  const [highlightedRoleIds, setHighlightedRoleIds] = useState(
    defaultHighlightedRoleIds || [],
  );

  // expand/collapse rapid reviews
  const [rapidAnchorEl, setRapidAnchorEl] = useState(null);
  const handleClickRapid = event => {
    setRapidAnchorEl(rapidAnchorEl ? null : event.currentTarget);
    if (!rapidAnchorEl) {
      history.push(
        `/preprints/${
          preprint.uuid
        }/rapid-reviews/${event.currentTarget.getAttribute(
          'aria-describedby',
        )}`,
      );
    }
  };

  // expand/collapse longform reviews
  const [longformAnchorEl, setLongformAnchorEl] = useState(null);
  const handleClickLongform = event => {
    setLongformAnchorEl(longformAnchorEl ? null : event.currentTarget);
    if (!longformAnchorEl) {
      history.push(
        `/preprints/${
          preprint.uuid
        }/full-reviews/${event.currentTarget.getAttribute('aria-describedby')}`,
      );
    }
  };

  // react html parser options so the comments do not create an editable interface
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

  const options = {
    decodeEntities: true,
    transform,
  };

  useEffect(() => {
    let reviewNode;
    if (location.pathname.includes('full-reviews')) {
      reviewNode = document.querySelector(
        `[aria-describedby='${location.pathname.split('full-reviews/')[1]}']`,
      );
      setLongformAnchorEl(reviewNode);
    } else if (location.pathname.includes('rapid-reviews')) {
      reviewNode = document.querySelector(
        `[aria-describedby='${location.pathname.split('rapid-reviews/')[1]}']`,
      );
      setRapidAnchorEl(reviewNode);
    } else if (location.pathname.includes('reviews')) {
      reviewNode = document.querySelector(
        `[aria-describedby='${location.pathname.split('reviews/')[1]}']`,
      );
      setLongformAnchorEl(reviewNode);
    }
  }, []);

  useEffect(() => {
    if (
      rapidContent &&
      Object.keys(rapidContent).length !== 0 &&
      rapidContent.constructor === Object
    ) {
      const all = [...allRapidReviews, rapidContent];
      setAllRapidReviews(all);
    }

    if (longContent) {
      const all = [...publishedReviews, longContent];
      setPublishedReviews(all);
    }
  }, [
    rapidContent,
    longContent,
    publishedTitle,
    publishedComment,
    content,
    commentTitle,
    location,
  ]);

  useEffect(() => {
    if (
      defaultHighlightedRoleIds &&
      !isEqual(defaultHighlightedRoleIds, highlightedRoleIds)
    ) {
      setHighlightedRoleIds(defaultHighlightedRoleIds);
    }
  }, [defaultHighlightedRoleIds, highlightedRoleIds]);

  useEffect(() => {
    if (communitiesData) {
      let filteredCommunities = [];
      communitiesData.filter(community => {
        return (
          allReviews.length &&
          allReviews.filter(review => {
            if (community.members.length) {
              community.members.map(member => {
                if (review.author) {
                  if (review.author.uuid === member.uuid) {
                    filteredCommunities.push({
                      name: community.name,
                      uuid: community.uuid,
                      member: member.uuid,
                    });
                  }
                } else if (review.authors) {
                  review.authors.map(author => {
                    if (author.uuid === member.uuid) {
                      filteredCommunities.push({
                        name: community.name,
                        uuid: community.uuid,
                        member: member.uuid,
                      });
                    }
                  });
                }
              });
            }
            if (community.owners.length) {
              community.owners.map(member => {
                if (review.author) {
                  if (review.author.uuid === member.uuid) {
                    filteredCommunities.push({
                      name: community.name,
                      uuid: community.uuid,
                      member: member.uuid,
                    });
                  }
                } else if (review.authors) {
                  review.authors.map(author => {
                    if (author.uuid === member.uuid) {
                      filteredCommunities.push({
                        name: community.name,
                        uuid: community.uuid,
                        member: member.uuid,
                      });
                    }
                  });
                }
              });
            }
          })
        );
      });

      setCommunities(filteredCommunities);
    }
  }, [
    allReviews,
    allRapidReviews,
    communitiesData,
    filteredRapid,
    filteredPublished,
    filteredReviews,
    publishedReviews,
    newRequest,
  ]);

  useEffect(() => {
    console.log(filteredRapid);
    console.log(filteredPublished);
    if (selectedCommunities.length) {
      const rapid = allRapidReviews.filter(rapidReview => {
        return communities.some(
          community => rapidReview.author.uuid === community.member,
        );
      });

      const published = publishedReviews.filter(publishedReview => {
        return publishedReview.authors.some(author => {
          return communities.some(
            community => author.uuid === community.member,
          );
        });
      });

      const allFilteredReviews = [...filteredRapid, ...filteredPublished];

      setFilteredRapid(rapid);
      setFilteredPublished(published);
      setFilteredReviews(allFilteredReviews);
    } else {
      setFilteredRapid(allRapidReviews);
      setFilteredPublished(publishedReviews);
      setFilteredReviews(allReviews);
    }
  }, [selectedCommunities]);

  if (loadingCommunities) {
    return <Loading />;
  } else if (communityError) {
    return <NotFound />;
  } else {
    return (
      <div>
        {filteredReviews.length ? (
          <div className={classes.root}>
            {communities &&
            Array.isArray(communities) &&
            communities.length > 0 ? (
              <Grid container item spacing={1} alignItems="center" xs={12}>
                <Grid item>
                  <InputLabel id="communities-label">
                    Filter reviews by community
                  </InputLabel>
                </Grid>
                <Grid item>
                  <Select
                    labelId="communities-label"
                    id="communities"
                    className={classes.select}
                    multiple
                    value={selectedCommunities}
                    onChange={ev => {
                      setSelectedCommunities(ev.target.value);
                    }}
                    input={<Input id="communities-select-multiple" />}
                    renderValue={() => (
                      <div className={classes.chips}>
                        {selectedCommunities.map(value => (
                          <Chip
                            key={value}
                            label={value}
                            className={classes.chip}
                          />
                        ))}
                      </div>
                    )}
                  >
                    {communities.map(community => (
                      <MenuItem key={community.uuid} value={community.name}>
                        {community.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              </Grid>
            ) : null}
            <Accordion
              className={classes.accordion}
              expanded={expandRapid}
              onChange={handleChangeRapid(!expandRapid)}
            >
              <AccordionSummary
                expandIcon={expandRapid ? 'collapse' : 'expand'}
                aria-controls="rapid-reviews-content"
                id="rapid-reviews-header"
              >
                <Typography variant="h3" component="h3">
                  Rapid PREreviews
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {filteredRapid && filteredRapid.length ? (
                  <div>
                    <Typography variant="h4" component="h4" gutterBottom>
                      Reviewers
                    </Typography>
                    <div>
                      <Reviewers
                        preprintId={preprint.uuid}
                        allReviews={filteredRapid}
                        hasReviewed={rapidContent}
                        user={user}
                      />
                    </div>
                    {filteredRapid.map(review => (
                      <div key={review.uuid}>
                        <div className={classes.vh}>
                          <Link
                            component="button"
                            className={classes.link}
                            variant="body1"
                            aria-describedby={review.uuid}
                            type="button"
                            onClick={handleClickRapid}
                            color="secondary"
                          >
                            See review
                          </Link>
                        </div>
                        <RapidReviewReader
                          anchorEl={rapidAnchorEl}
                          handleAnchor={handleClickRapid}
                          height={height}
                          review={review}
                          user={user}
                          identifier={preprint.handle}
                          roleIds={highlightedRoleIds}
                          role={role}
                          isReader={isReader}
                        />
                      </div>
                    ))}
                    <Barplot
                      stats={getYesNoStats(filteredRapid)}
                      nReviews={filteredRapid.length}
                    >
                      <ShareMenu
                        identifier={preprint.handle}
                        roleIds={highlightedRoleIds}
                      />
                    </Barplot>

                    <TextAnswers
                      user={user}
                      role={role}
                      reviews={filteredRapid}
                      isModerationInProgress={isModerationInProgress}
                      onModerate={onModerate}
                    />
                  </div>
                ) : (
                  <div>No rapid PREreviews yet.</div>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion
              className={classes.accordion}
              expanded={expandLong}
              onChange={handleChangeLong(!expandLong)}
            >
              <AccordionSummary
                expandIcon={expandLong ? 'collapse' : 'expand'}
                aria-controls="longform-content"
                id="longform-header"
              >
                <Typography variant="h3" component="h3">
                  Full PREreviews
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {filteredPublished && filteredPublished.length ? (
                  <div>
                    <Typography variant="h4" component="h4" gutterBottom>
                      Reviewers
                    </Typography>
                    <div>
                      <Reviewers
                        preprintId={preprint.uuid}
                        role={role}
                        allReviews={filteredPublished}
                        hasReviewed={longContent && longContent.length}
                        user={user}
                      />
                    </div>
                    <div>
                      {filteredPublished.map(review => {
                        if (
                          review.isPublished &&
                          review.drafts &&
                          review.drafts.length
                        ) {
                          const reviewDate = new Date(review.updatedAt);
                          const reviewContent =
                            review.drafts[review.drafts.length - 1];
                          return (
                            <div key={review.uuid}>
                              <Accordion expanded={true}>
                                <AccordionSummary
                                  aria-controls={`review-content-${review.uuid}`}
                                  id={`review-header-${review.uuid}`}
                                >
                                  <Typography component="div" variant="h4">
                                    {review.authors.length ? (
                                      <>
                                        {review.authors.length >= 2 ? (
                                          review.authors
                                            .slice(0, 2)
                                            .map(author => (
                                              <span key={author.uuid}>
                                                {author.defaultPersona
                                                  ? author.defaultPersona.name
                                                  : author.name}
                                              </span>
                                            ))
                                        ) : (
                                          <span key={review.authors[0].uuid}>
                                            {review.authors[0].defaultPersona
                                              ? review.authors[0].defaultPersona
                                                  .name
                                              : review.authors[0].name}
                                          </span>
                                        )}
                                        {review.authors.length > 2 ? '...' : null}
                                      </>
                                    ) : (
                                      <span>Anonymous</span>
                                    )}
                                  </Typography>
                                  <Typography
                                    className={classes.date}
                                    align="right"
                                    component="div"
                                    variant="body2"
                                  >
                                    {reviewDate.toLocaleDateString('en-US')}
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails className={classes.spacing}>
                                  <Box>
                                    <Typography
                                      component="div"
                                      key={`content-${review.uuid}`}
                                    >
                                      {ReactHtmlParser(
                                        reviewContent.contents
                                          .substring(0, 600)
                                          .concat('...'),
                                        options,
                                      )}
                                      <Link
                                        component="button"
                                        className={classes.link}
                                        variant="body1"
                                        aria-describedby={review.uuid}
                                        type="button"
                                        onClick={handleClickLongform}
                                        color="secondary"
                                      >
                                        Read more
                                      </Link>
                                    </Typography>
                                    <Grid
                                      container
                                      justify="space-between"
                                      alignItems="center"
                                    >
                                      <Grid item>
                                        <Button
                                          aria-describedby={review.uuid}
                                          type="button"
                                          onClick={handleClickLongform}
                                          color="secondary"
                                        >
                                          Comment
                                        </Button>
                                        <LongformReviewReader
                                          anchorEl={longformAnchorEl}
                                          handleAnchor={handleClickLongform}
                                          content={content}
                                          commentTitle={commentTitle}
                                          publishedComment={publishedComment}
                                          onChange={handleCommentChange}
                                          onSubmit={handleCommentSubmit}
                                          height={height}
                                          review={review}
                                          user={user}
                                          isReader={isReader}
                                        />
                                      </Grid>
                                      <Grid item>
                                        <ReportButton
                                          uuid={review.uuid}
                                          type="fullReview"
                                        />
                                      </Grid>
                                    </Grid>
                                  </Box>
                                </AccordionDetails>
                              </Accordion>
                            </div>
                          );
                        }
                        if (typeof review === 'string') {
                          return (
                            <div key={'new-review'}>
                              <div>{'New user PREreview'}</div>
                              <div>
                                <span key={user.uuid}>by {user.name}</span>
                              </div>
                              <Typography component="div">
                                {ReactHtmlParser(review, options)}
                              </Typography>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                ) : (
                  <Typography component="div" variant="body2">
                    No full PREreviews to display.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </div>
        ) : (
          <Typography component="div" variant="body2">
            There are no PREreviews on this preprint yet. To add your review,
            click on &quot;Add PREReview(s)&quot;. To request reviews, click on
            &quot;Add Request&quot; in the menu above.
          </Typography>
        )}
      </div>
    );
  }
}

ReviewReader.propTypes = {
  user: PropTypes.object,
  role: PropTypes.object,
  preprint: PropTypes.object, // DOI or arXivID
  onHighlighedRoleIdsChange: PropTypes.func,
  defaultHighlightedRoleIds: PropTypes.arrayOf(PropTypes.string),
  isModerationInProgress: PropTypes.bool,
  onModerate: PropTypes.func,
  rapidContent: PropTypes.object,
  longContent: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  newRequest: PropTypes.bool,
  height: PropTypes.number,
  isReader: PropTypes.bool,
};
