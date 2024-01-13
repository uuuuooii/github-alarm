'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [username, setUsername] = useState<string>('');
  const [data, setData] = useState();
  // console.log(data);
  // console.log(username);


  // TODO: 전체 commit 수 가져오기

  const getData = async () => {
    const token = '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';
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    try {
      // 유저 정보 가져오기
      const userResponse = await axios.get(`https://api.github.com/users/${username}`);
      const user = userResponse.data;
      // console.log(userResponse);

      // 레포지토리 정보 가져오기
      const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos`);
      const repos = reposResponse.data;
      // console.log(repos);

      const today = new Date().toLocaleDateString(); // 현재 날짜를 문자열로 변환
      let todayCommits = 0;

      for (let i = 0; i < repos.length; i++) {
        const repo = repos[i];

        const commitsResponse = await axios.get(`https://api.github.com/repos/${username}/${repo.name}/commits`);
        const commitData = commitsResponse.data;

        for (let j = 0; j < commitData.length; j++) {
          const commit = commitData[j];
          const commitDate = new Date(commit.commit.author.date).toLocaleDateString();

          if (commitDate === today) {
            todayCommits++;
          }
        }
      }

      console.log(`Commits on ${today}: ${todayCommits}`);


    } catch (err) {
      console.log(err);
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    getData();
  };


  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <form onSubmit={onSubmit}>
      <input type="text" value={username} onChange={onChangeInput} />
    </form>
  );
}
