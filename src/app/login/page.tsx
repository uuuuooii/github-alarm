'use client';

import axios from 'axios';
import React, { useEffect } from 'react';


const Login = () => {


  const loginWithGithub = () => {
    window.location.assign(`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_ID}`);
  };

  useEffect(() => {
    // http://localhost:3000/login?code=6b6f673a05846ee0f5dd
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParam = urlParams.get("code");
    console.log(codeParam);

  }, []);


  return (
    <button onClick={loginWithGithub}>Login</button>
  );
};

export default Login;