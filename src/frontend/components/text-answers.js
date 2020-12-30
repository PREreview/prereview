import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from '@reach/menu-button';
import Value from './value';
import RoleBadge from './role-badge';
import { getId, arrayify } from '../utils/jsonld';
import { getTextAnswers } from '../utils/stats';

export default function TextAnswers({
  user,
  role,
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
                      key={author.identity}
                    >
                      <div className="text-answers__user-badge-container">
                        <RoleBadge user={author}>
                          {isLoggedIn && (
                            <MenuItem
                              disabled={isModerationInProgress}
                              onSelect={() => {
                                onModerate(author.identity);
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
  role: PropTypes.object,
  reviews: PropTypes.array.isRequired,
  isModerationInProgress: PropTypes.bool,
  onModerate: PropTypes.func,
};
