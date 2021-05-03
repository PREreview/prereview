import React from 'react';
import PropTypes from 'prop-types';
import RoleBadge from './role-badge';
import { getTextAnswers } from '../utils/stats';

// material ui imports
import { withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItemMui from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';

const ListItem = withStyles(theme => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(ListItemMui);
export default function TextAnswers({
  user,
  reviews,
  isModerationInProgress,
  onModerate,
}) {
  const answers = getTextAnswers(reviews);

  const hasAnswers = answers[0].answers.length;

  if (!hasAnswers) {
    return null;
  }

  const isLoggedIn = !!user;

  return (
    <Container>
      {answers &&
        answers.map(({ questionId, question, answers }) => (
          <>
            <Box key={questionId} my={4} borderBottom="1px solid #C1BFBF">
              <Typography variant="h5">{question}</Typography>
            </Box>
            <List>
              {answers.map(({ author, text }) => {
                if (text && text.length) {
                  return (
                    <ListItem>
                      <Grid container>
                        <Grid item key={author ? author.uuid : user.uuid}>
                          <RoleBadge user={author ? author : user}>
                            {isLoggedIn && (
                              <div
                                disabled={isModerationInProgress}
                                onSelect={() => {
                                  onModerate(author ? author.uuid : user.uuid);
                                }}
                              >
                                Report PREreview
                              </div>
                            )}
                          </RoleBadge>
                        </Grid>
                        <Grid item>
                          <Typography>{text}</Typography>
                        </Grid>
                      </Grid>
                    </ListItem>
                  );
                }
              })}
            </List>
          </>
        ))}
    </Container>
  );
}

TextAnswers.propTypes = {
  user: PropTypes.object,
  reviews: PropTypes.array.isRequired,
  isModerationInProgress: PropTypes.bool,
  onModerate: PropTypes.func,
};
