'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import axios from 'axios';
import Jandi from '@components/components/jandi';

export default function Home() {
  const [username, setUsername] = useState<string>('');
  const [commit, setCommit] = useState<number>(0);
  console.log(commit);
  const getData = async () => {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    try {
      // 유저 정보 가져오기
      // const userResponse = await axios.get(`https://api.github.com/users/${username}`);
      // const user = userResponse.data;
      // console.log(userResponse);

      // 레포지토리 정보 가져오기
      const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos`);
      const repos = reposResponse.data;
      // console.log(repos);


      let commitCount = 0;

      for (let i = 0; i < repos.length; i++) {
        const repo = repos[i];

        // 레포지토리별 커밋 정보 가져오기
        const commitsResponse = await axios.get(`https://api.github.com/repos/${username}/${repo.name}/commits`);
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
    <div>
      <form onSubmit={onSubmit}>
        <input type="text" value={username} onChange={onChangeInput} />
      </form>
      <Jandi username={username} />
    </div>
  );
}
