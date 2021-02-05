// base imports
import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

// contexts
import UserProvider from '../contexts/user-context';

// components
import Button from './button';
import Checkbox from './checkbox';
import HeaderBar from './header-bar';
import JoinModal from './join-modal';
import LoginModal from './login-modal';
import Org from './org';
import XLink from './xlink';

// constants
import { ORG } from '../constants';

// TODO make clear that by logging in user accepts the code of conduct

export default function Login() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const location = useLocation();

  const [thisUser] = useContext(UserProvider.context);
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(true)

  const handleJoinModalClose = () => {
    setLoginModalOpen(true)
    setJoinModalOpen(false)
  }

  const handleLoginModalClose = () => {
    setLoginModalOpen(false)
  }

  return (
    <div className="login">
      <Helmet>
        <title>{ORG} • Login</title>
      </Helmet>
      <HeaderBar thisUser={thisUser} />
        { joinModalOpen ? <JoinModal open={joinModalOpen} handleClose={handleJoinModalClose}/> : null }
        { loginModalOpen ? <LoginModal open={loginModalOpen} handleClose={(handleLoginModalClose)} /> : null }
    </div>
  );
}