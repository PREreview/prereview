// base imports
import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useHistory } from 'react-router-dom';

// contexts
import UserProvider from '../contexts/user-context';

// components
import Banner from './banner';
import HeaderBar from './header-bar';
import JoinModal from './join-modal';
import LoginModal from './login-modal';

// constants
import { ORG } from '../constants';

export default function Login() {
  const history = useHistory();

  useEffect(() => {
    if (thisUser) {
      history.push('/reviews');
      return;
    }
    window.scrollTo(0, 0);
  }, []);

  const [thisUser] = useContext(UserProvider.context);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(true);

  const handleJoinModalClose = () => {
    setLoginModalOpen(true);
    setJoinModalOpen(false);
  };

  const handleLoginModalClose = () => {
    console.log('loginmodalclose');
    setLoginModalOpen(false);
    return history.push('/');
  };

  return (
    <div className="login">
      <Helmet>
        <title>{ORG} • Login</title>
      </Helmet>
      <HeaderBar thisUser={thisUser} />
      {joinModalOpen ? (
        <JoinModal open={joinModalOpen} handleClose={handleJoinModalClose} />
      ) : null}
      {loginModalOpen ? (
        <LoginModal open={loginModalOpen} handleClose={handleLoginModalClose} />
      ) : null}
    </div>
  );
}
