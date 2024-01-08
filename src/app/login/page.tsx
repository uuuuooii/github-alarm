'use client';

import React from 'react';

const Login = () => {
  console.log('asdad');
  console.log(process.env.NEXT_PUBLIC_GITHUB_ID);
  const loginWithGithub = () => {
    window.location.assign(`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_ID}`);
  };
  return (
    <button onClick={loginWithGithub}>Login</button>
  );
};

export default Login;