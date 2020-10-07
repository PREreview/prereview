import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MdHelpOutline } from 'react-icons/md';
import { QUESTIONS } from '../constants';
import Value from './value';
import RadioButton from './radio-button';
import IconButton from './icon-button';
import Collapse from './collapse';
import NoticeBox from './notice-box';
import CollabEditor from './collab-editor';

export default function RapidFormFragment({ answerMap = {}, onChange }) {
  function handleChange(key, value) {
    onChange(key, value);
  }

  const [isOpenedMap, setIsOpenedMap] = useState(
    QUESTIONS.filter(q => q.type == 'YesNoQuestion').reduce((map, q) => {
      map[q.identifier] = false;
      return map;
    }, {}),
  );

  const [isOpenedLongform, setIsOpenedLongform] = useState(false);

  return (
    <div className="rapid-form-fragment">
      <fieldset className="rapid-form-fragment__text-response-questions">
        {QUESTIONS.map(({ type, identifier, question, help, required }) => {
          const answer = answerMap[identifier];

          return type == 'YesNoQuestion' ? (
            <Fragment key={identifier}>
              <div className="radid-form-fragment__question-row">
                <div className="radid-form-fragment__question">
                  <Value tagName="p">{question}</Value>

                  {!!help && (
                    <IconButton
                      className="radid-form-fragment__help"
                      onClick={e => {
                        e.preventDefault();
                        setIsOpenedMap(
                          Object.assign({}, isOpenedMap, {
                            [identifier]: !isOpenedMap[identifier],
                          }),
                        );
                      }}
                    >
                      <MdHelpOutline />
                    </IconButton>
                  )}
                </div>

                <div className="rapid-form-fragment__radio-group">
                  <RadioButton
                    required={required}
                    inputId={`question-${identifier}-yes`}
                    name={identifier}
                    value="yes"
                    checked={answer === 'yes'}
                    onChange={e => {
                      handleChange(identifier, 'yes');
                    }}
                    label="Yes"
                  />

                  <RadioButton
                    required={required}
                    inputId={`question-${identifier}-no`}
                    name={identifier}
                    value="no"
                    checked={answer === 'no'}
                    onChange={e => {
                      handleChange(identifier, 'no');
                    }}
                    label="No"
                  />

                  <RadioButton
                    required={required}
                    inputId={`question-${identifier}-na`}
                    name={identifier}
                    value="n.a."
                    checked={answer === 'n.a.'}
                    onChange={e => {
                      handleChange(identifier, 'n.a.');
                    }}
                    label={<abbr title="Not Applicable">N.A.</abbr>}
                  />

                  <RadioButton
                    required={required}
                    inputId={`question-${identifier}-unsure`}
                    name={identifier}
                    value="unsure"
                    checked={answer === 'unsure'}
                    onChange={e => {
                      handleChange(identifier, 'unsure');
                    }}
                    label="Unsure"
                  />
                </div>

                {!!help && (
                  <Collapse isOpened={isOpenedMap[identifier]}>
                    <Value
                      tagName="p"
                      className="rapid-form-fragment__help-text"
                    >
                      {help}
                    </Value>
                  </Collapse>
                )}
              </div>
            </Fragment>
          ) : (
            <div
              key={identifier}
              className="radid-form-fragment__text-question-row"
            >
              <Value
                tagName="label"
                htmlFor={`question-${identifier}`}
                className="radid-form-fragment__text-question"
              >
                {question}
              </Value>

              <textarea
                required={required}
                className="radid-form-fragment__text-answer"
                id={`question-${identifier}`}
                name={identifier}
                rows="2"
                value={answer || ''}
                onChange={e => {
                  handleChange(identifier, e.target.value);
                }}
              />
            </div>
          );
        })}

        <Fragment key={'longform'}>
          <div className="radid-form-fragment__question-row">
            <div className="radid-form-fragment__question">
              <Value tagName="p">Is this a longform review?</Value>
            </div>

            <div className="rapid-form-fragment__radio-group">
              <RadioButton
                inputId={`question-longform-yes`}
                name="longform"
                value="yes"
                checked={!!isOpenedLongform}
                onChange={() => {
                  handleChange('longform', 'yes');
                }}
                onClick={() => {
                  setIsOpenedLongform(true);
                }}
                label="Yes"
              />

              <RadioButton
                inputId={`question-longform-no`}
                name="longform"
                value="no"
                checked={!isOpenedLongform}
                onClick={() => {
                  setIsOpenedLongform(false);
                }}
                onChange={() => {
                  handleChange('longform', 'no');
                }}
                label="No"
              />
            </div>

            <Collapse isOpened={!!isOpenedLongform}>
              <Value tagName="div" className="rapid-form-fragment__help-text">
                <CollabEditor />
              </Value>
            </Collapse>
          </div>
        </Fragment>
      </fieldset>
      <NoticeBox type="warning">
        Beta Notice: Please note that any reviews submitted during the beta
        stage of Outbreak Science Rapid PREreview will be migrated over into
        future updates.
      </NoticeBox>
    </div>
  );
}

RapidFormFragment.propTypes = {
  onChange: PropTypes.func.isRequired,
  answerMap: PropTypes.object,
};
