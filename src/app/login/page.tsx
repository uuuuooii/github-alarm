"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";

const Login = () => {
  const [isRerender, setIsRerender] = useState(false);
  const [userDate, setUserData] = useState({});

  const CLIENT_ID = "9a95ae529088d6393993";
  const loginWithGithub = () => {
    window.location.assign(
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`
    );
  };

  const getUserData = async () => {
    const token = localStorage.getItem("accessToken");
    console.log(token);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    // 유저 이름 가져오는거 맞음?
    const userResponse = await axios.get(
      `https://api.github.com/users`,
      config
    );
    const user = userResponse.data;
    setUserData(user);
    console.log(userResponse);
  };

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParam = urlParams.get("code");
    console.log(codeParam);
    console.log(localStorage.getItem("accessToken"));
    if (codeParam && localStorage.getItem("accessToken") === null) {
      const getAccessToken = async () => {
        await fetch(
          `http://localhost:3000/api/getAccessToken?code=${codeParam}`,
          { method: "GET" }
        )
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log(data);
            if (data.access_token) {
              localStorage.setItem("accessToken", data.access_token);
              setIsRerender(!isRerender);
            }
          });
      };
      getAccessToken();
    }
  }, []);

  return (
    <div>
      {typeof window !== "undefined" && localStorage.getItem("accessToken") ? (
        <div>
          <p>accessToken이 있습니다</p>
          <button
            onClick={() => {
              typeof window !== "undefined" &&
                localStorage.removeItem("accessToken");
              setIsRerender(!isRerender);
            }}
          >
            Log out
          </button>
          <div>
            <p>Github User Data</p>
            <button onClick={getUserData}>Get Data</button>
            {Object.keys(userDate).length !== 0 ? (
              <div>
                <p>{userDate.login}</p>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p>로그인 해주세요</p>
          <button onClick={loginWithGithub}>login</button>
        </div>
      )}

    </div>
  );
};

export default Login;