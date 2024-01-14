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

        // 레포지토리별 커밋 정보 가져오기
        const commitsResponse = await axios.get(`https://api.github.com/repos/${username}/${repo.name}/commits`);
        const commitData = commitsResponse.data;


        // 오늘 날짜의 커밋 필터링
        const todayCommits = commitData.filter((commit: { commit: { author: { date: string | number | Date; }; }; }) => {
          const commitDate = new Date(commit.commit.author.date).toLocaleDateString();
          const today = new Date().toLocaleDateString();
          return commitDate === today;
        });

        // 레포지토리명과 오늘의 커밋 수 출력
        console.log(`레포지토리: ${repo.name}, 오늘 커밋: ${todayCommits.length}`);
      }



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
