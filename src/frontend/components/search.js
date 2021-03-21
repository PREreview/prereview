// base imports
/* eslint-disable no-use-before-define */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// material ui components
import useAutocomplete from '@material-ui/lab/useAutocomplete';
import MuiButton from '@material-ui/core/Button';
import NoSsr from '@material-ui/core/NoSsr';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';

// hooks
import { usePostFullReviewInvite } from '../hooks/api-hooks.tsx';

const Button = styled(MuiButton)`
  margin-top: 1rem;
  text-transform: none;
`;

const Label = styled('label')`
  display: block;
  font-size: 1rem;
  line-height: 1.5;
  padding: 0 0 10px;
`;

const InputWrapper = styled('div')`
  width: 300px;
  border: 1px solid #d9d9d9;
  background-color: #fff;
  border-radius: 4px;
  padding: 1px;
  display: flex;
  flex-wrap: wrap;

  &:hover {
    border-color: #40a9ff;
  }

  &.focused {
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  & input {
    font-size: 14px;
    height: 30px;
    box-sizing: border-box;
    padding: 4px 6px;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
  }
`;

const Tag = styled(({ label, onDelete, ...props }) => (
  <div {...props}>
    <span>{label}</span>
    <CloseIcon onClick={onDelete} />
  </div>
))`
  display: flex;
  align-items: center;
  height: 24px;
  margin: 2px;
  line-height: 22px;
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;

  &:focus {
    border-color: #40a9ff;
    background-color: #e6f7ff;
  }

  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & svg {
    font-size: 12px;
    cursor: pointer;
    padding: 4px;
  }
`;

const Listbox = styled('ul')`
  width: 300px;
  margin: 2px 0 0;
  padding: 0;
  position: absolute;
  list-style: none;
  background-color: #fff;
  overflow: auto;
  max-height: 250px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;

  & li {
    padding: 5px 12px;
    display: flex;

    & span {
      flex-grow: 1;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected='true'] {
    background-color: #fafafa;
    font-weight: 600;

    & svg {
      color: #1890ff;
    }
  }

  & li[data-focus='true'] {
    background-color: #e6f7ff;
    cursor: pointer;

    & svg {
      color: #000;
    }
  }
`;

const Search = ({
  handleClose,
  community,
  isMentor,
  isModerator,
  reviewId,
  users,
}) => {
  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    value,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    id: 'add-authors',
    defaultValue: [],
    multiple: true,
    options: users,
    getOptionLabel: option =>
      option.defaultPersona
        ? option.defaultPersona.name || option.defaultPersona.orcid
        : option.name || option.orcid,
  });

  const [disabledSubmit, setDisabledSubmit] = useState(true);
  const [invitees, setInvitees] = useState(null);

  const { mutate: postInvite } = usePostFullReviewInvite({
    id: reviewId,
    role: isMentor ? 'mentors' : 'authors',
  });

  // add users to a community if a community is present and isModerator is true
  const handleAddModerators = () => {
    console.log(community);
    if (value.length) {
      value.map(user => {
        fetch(`/api/v2/communities/${community}/owners/${user.uuid}`, {
          method: 'PUT',
        })
          .then(response => {
            if (response.status === 201) {
              return response.json();
            }
            throw new Error(response.message);
          })
          .then(() => {
            handleClose();
            alert('Moderator(s) successfully added to community.');
            return;
          })
          .catch(err => alert(`An error occurred: ${err.message}`));
      });
    }
  };

  // add users to a community if a community is present
  const handleAddUsers = () => {
    console.log(community);
    if (value.length) {
      value.map(user => {
        fetch(`/api/v2/communities/${community}/members/${user.uuid}`, {
          method: 'PUT',
        })
          .then(response => {
            if (response.status === 201) {
              return response.json();
            }
            throw new Error(response.message);
          })
          .then(() => {
            handleClose();
            alert('User(s) successfully added to community.');
            return;
          })
          .catch(err => alert(`An error occurred: ${err.message}`));
      });
    }
  };

  // send invites to users if being added to a review
  const handleInvite = () => {
    console.log('mentor: ', isMentor);
    console.log('invited: ', invitees);
    console.log('value: ', value);

    postInvite({
      pid: value[0].uuid,
    })
      .then(() => {
        alert('Invites sent successfully.');
        handleClose();
      })
      .catch(err => {
        alert(`An error occurred: ${err.message}`);
        handleClose();
      });
  };

  useEffect(() => {
    value.length ? setDisabledSubmit(false) : setDisabledSubmit(true);
  }, [value]);

  return (
    <NoSsr>
      <div>
        <div {...getRootProps()}>
          <Label {...getInputLabelProps()}>Search users by name or ORCID</Label>
          <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
            {value.map((option, index) => (
              <Tag
                key={`tag-${index}`}
                label={
                  option.defaultPersona
                    ? option.defaultPersona.name
                    : option.name
                    ? option.name
                    : 'Anonymous'
                }
                {...getTagProps({ index })}
              />
            ))}

            <input {...getInputProps()} />
          </InputWrapper>
        </div>
        {groupedOptions.length > 0 ? (
          <Listbox {...getListboxProps()}>
            {groupedOptions.map((option, index) => (
              <li
                key={`option-${index}`}
                {...getOptionProps({ option, index })}
              >
                <span>
                  {option.defaultPersona
                    ? option.defaultPersona.name
                    : option.name
                    ? option.name
                    : 'Anonymous'}
                </span>
                <CheckIcon fontSize="small" />
              </li>
            ))}
          </Listbox>
        ) : null}
        <Button
          disabled={disabledSubmit}
          variant="contained"
          color="primary"
          type="button"
          onClick={
            community
              ? isModerator
                ? handleAddModerators
                : handleAddUsers
              : handleInvite
          }
        >
          {community
            ? isModerator
              ? `Add moderator(s)`
              : `Add user(s)`
            : `Send invitations`}
        </Button>
      </div>
    </NoSsr>
  );
};

Search.propTypes = {
  handleClose: PropTypes.func.isRequired,
  community: PropTypes.string,
  isMentor: PropTypes.bool,
  isModerator: PropTypes.bool,
  reviewId: PropTypes.string,
  users: PropTypes.array.isRequired,
};

export default Search;
