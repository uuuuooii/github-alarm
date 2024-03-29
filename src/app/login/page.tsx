"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";

interface UserDataProps {
  id: number;
  login: string;
}

const Login = () => {
  const [isRerender, setIsRerender] = useState(false);
  const [userDate, setUserData] = useState<UserDataProps>({ id: 0, login: '' });
  const [commit, setCommit] = useState<number>(0);

  const token = typeof window !== 'undefined' && localStorage.getItem("accessToken");

  // github으로 로그인 code 받기
  // 예) code=4bf42ada452ddda0e66d
  const loginWithGithub = () => {
    window.location.assign(
      `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`
    );
  };

  const getUserData = async () => {

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const userResponse = await axios.get(
      `/api/userData`,
      config
    );
    const user = userResponse.data;
    setUserData(user);
    console.log(user);

    // 레포지토리 정보 가져오기
    const reposResponse = await axios.get(`https://api.github.com/users/${user.login}/repos`, config);
    const repos = reposResponse.data;

    let commitCount = 0;

    for (let i = 0; i < repos.length; i++) {
      const repo = repos[i];

      // 레포지토리별 커밋 정보 가져오기
      const commitsResponse = await axios.get(`https://api.github.com/repos/${user.login}/${repo.name}/commits`, config);
      const commitData = commitsResponse.data;

      if (commitData.length === 0) {
        console.log(`저장소에 커밋이 없음: ${repo.name}`);
        continue; // 다음 저장소로 건너뛰기
      }
      // 오늘 날짜의 커밋 필터링
      const todayCommits = commitData.filter((commit: { commit: { author: { date: string | number | Date; }; }; }) => {
        const commitDate = new Date(commit.commit.author.date).toLocaleDateString();
        const today = new Date().toLocaleDateString();
        return commitDate === today;
      });


      commitCount += todayCommits.length;
      setCommit(commitCount);
      // 레포지토리명과 오늘의 커밋 수 출력
      console.log(`레포지토리: ${repo.name}, 오늘 커밋: ${todayCommits.length}`);
      console.log(` 오늘 커밋 수: ${commitCount}`);
    }

  };

  useEffect(() => {
    // url에 있는 code 가져오기
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParam = urlParams.get("code");
    console.log(codeParam);
    if (codeParam && token === null) {

      const getAccessToken = async () => {
        await fetch(
          `/api/accessToken?code=${codeParam}`,
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
            <div>
              <p>ID: {userDate.login}</p>
              <p>오늘 커밋 수: {commit}</p>
            </div>
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