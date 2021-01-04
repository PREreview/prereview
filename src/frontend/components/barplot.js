import React from 'react';
import PropTypes from 'prop-types';

export default function Barplot({ stats, nReviews, children }) {
  return (
    <div className="barplot">
      {stats ? (
        <div>
          <div className="barplot__question-list-header">
            {}
            <div className="barplot__question-list-header__left">
              <span>Showing {nReviews} Reviews</span>
            </div>

            <div className="barplot__question-list-header__right">
              <div className="barplot__key">
                <div className="barplot__key-item">
                  <div className="barplot__key-color-chip barplot__key-color-chip--yes" />
                  <span className="barplot__key-label">Yes</span>
                </div>

                <div className="barplot__key-item">
                  <div className="barplot__key-color-chip barplot__key-color-chip--unsure" />
                  <span className="barplot__key-label">Unsure</span>
                </div>

                <div className="barplot__key-item">
                  <div className="barplot__key-color-chip barplot__key-color-chip--na" />
                  <span className="barplot__key-label">N/A</span>
                </div>

                <div className="barplot__key-item">
                  <div className="barplot__key-color-chip barplot__key-color-chip--no" />
                  <span className="barplot__key-label">No</span>
                </div>
              </div>
              {!!children && <div className="barplot__share">{children}</div>}
            </div>
          </div>
        </div>
      ) : null}

      <ul className="barplot__question-list">
        {stats ? (
          stats.map(
            ({ questionId, nReviews, question, yes, no, na, unsure }) => (
              <li
                className="barplot__question-list__item"
                key={questionId}
                tabIndex={0}
              >
                <table className="barplot__question-table">
                  <caption className="barplot__question">{question}</caption>
                  <thead className="barplot__table-header">
                    <tr className="barplot__segment-titles">
                      <th
                        className="barplot__segment-title"
                        style={{ width: `${(yes.length / nReviews) * 100}%` }}
                      >
                        {yes.length ? 'yes' : ''}
                      </th>

                      <th
                        className="barplot__segment-title"
                        style={{
                          width: `${(unsure.length / nReviews) * 100}%`,
                        }}
                      >
                        {unsure.length ? 'unsure' : ''}
                      </th>

                      <th
                        className="barplot__segment-title"
                        style={{ width: `${(na.length / nReviews) * 100}%` }}
                      >
                        {na.length ? 'N/A' : ''}
                      </th>

                      <th
                        className="barplot__segment-title"
                        style={{ width: `${(no.length / nReviews) * 100}%` }}
                      >
                        {no.length ? 'no' : ''}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="barplot__responses">
                    <tr className="barplot__bar-segments">
                      <td
                        className="barplot__bar-segment barplot__bar-segment--yes"
                        style={{ width: `${(yes.length / nReviews) * 100}%` }}
                      >
                        <span className="barplot__bar-segment__number">
                          {yes.length}
                        </span>
                      </td>

                      <td
                        className="barplot__bar-segment barplot__bar-segment--unsure"
                        style={{
                          width: `${(unsure.length / nReviews) * 100}%`,
                        }}
                      >
                        <span className="barplot__bar-segment__number">
                          {unsure.length}
                        </span>
                      </td>

                      <td
                        className="barplot__bar-segment barplot__bar-segment--na"
                        style={{ width: `${(na.length / nReviews) * 100}%` }}
                      >
                        <span className="barplot__bar-segment__number">
                          {na.length}
                        </span>
                      </td>

                      <td
                        className="barplot__bar-segment barplot__bar-segment--no"
                        style={{ width: `${(no.length / nReviews) * 100}%` }}
                      >
                        <span className="barplot__bar-segment__number">
                          {no.length}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </li>
            ),
          )
        ) : (
          <div>No rapid reviews. Would you like to leave one?</div>
        )}
      </ul>
    </div>
  );
}

Barplot.propTypes = {
  stats: PropTypes.array.isRequired,
  nReviews: PropTypes.number.isRequired,
  children: PropTypes.element, // share menu
};
