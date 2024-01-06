'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [username, setUsername] = useState<string>('');
  const [data, setData] = useState();
  // console.log(data);
  // console.log(username);


  // TODO: commit 수 확인하기

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

      // 14번째 레포 커밋 수 가져오기
      const repo = repos[14];
      const commitsResponse = await axios.get(`https://api.github.com/repos/${username}/${repo.name}/stats/contributors`);
      const commitData = commitsResponse.data;
      console.log(commitData);

      if (commitData.length === 0) {
        console.error('No commit data found for the repository.');
        return;
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
