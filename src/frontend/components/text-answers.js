import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from '@reach/menu-button';
import Value from './value';
import RoleBadge from './role-badge';
import { getTextAnswers } from '../utils/stats';

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
    <div className="text-answers">
      <dl>
        {answers &&
          answers.map(({ questionId, question, answers }) => (
            <div key={questionId}>
              <dt className="text-answers__question">
                <Value tagName="span">{question}</Value>
              </dt>
              {answers.map(({ author, text }) => {
                if (text && text.length) {
                  return (
                    <dd
                      className="text-answers__response-row"
                      key={author ? author.identity : user.identity}
                    >
                      <div className="text-answers__user-badge-container">
                        <RoleBadge user={author ? author : user}>
                          {isLoggedIn && (
                            <MenuItem
                              disabled={isModerationInProgress}
                              onSelect={() => {
                                onModerate(
                                  author ? author.identity : user.identity,
                                );
                              }}
                            >
                              Report Review
                            </MenuItem>
                          )}
                        </RoleBadge>
                      </div>

                      <Value className="text-answers__response">{text}</Value>
                    </dd>
                  );
                }
              })}
            </div>
          ))}
      </dl>
    </div>
  );
}

TextAnswers.propTypes = {
  user: PropTypes.object,
  reviews: PropTypes.array.isRequired,
  isModerationInProgress: PropTypes.bool,
  onModerate: PropTypes.func,
};
