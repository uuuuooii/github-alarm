import { query } from '@/lib/db';
import axios from 'axios';
import { NextResponse } from 'next/server';

export interface ExistingDataProps {
  commit_day: Date;
  commit_count: number;
}

export const getRepoData = async (
  authorization: string | NextResponse<unknown>,
  json: any
) => {
  const userId = 97392254; // 사용자 ID
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');

  const formattedDate = `${year}. ${month}. ${day}.`;

  console.log(formattedDate); // 예시: "2024. 02. 11."

  // 레포 정보
  const reposResponse = await fetch(
    `https://api.github.com/users/${json.login}/repos`,
    {
      method: 'GET',
      headers: {
        Authorization: String(authorization),
      },
    }
  );

  const repos = await reposResponse.json();

  let commitCount = 0;

  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];

    // 레포지토리별 커밋 정보 가져오기
    const commitsResponse = await axios.get(
      `https://api.github.com/repos/${json.login}/${repo.name}/commits`,
      {
        method: 'GET',
        headers: {
          Authorization: String(authorization),
        },
      }
    );
    const commitData = commitsResponse.data;

    if (commitData.length === 0) {
      console.log(`저장소에 커밋이 없음: ${repo.name}`);
      continue; // 다음 저장소로 건너뛰기
    }

    // 오늘 날짜의 커밋 필터링
    const todayCommits = commitData.filter(
      (commit: { commit: { author: { date: string | number | Date } } }) => {
        const commitDate = new Date(
          commit.commit.author.date
        ).toLocaleDateString();

        return commitDate === formattedDate;
      }
    );

    commitCount += todayCommits.length;
    // 레포지토리명과 오늘의 커밋 수 출력
    console.log(`레포지토리: ${repo.name}, 오늘 커밋: ${todayCommits.length}`);
    console.log(` 오늘 커밋 수: ${commitCount}`);
  }

  // 조회
  const existingData = (await query({
    query: 'SELECT commit_day, commit_count FROM commit WHERE id = ?',
    values: [userId],
  })) as ExistingDataProps[];
  console.log(existingData);

  // 첫 번째가 아니라 전체 확인 해야함
  const existingRecord = existingData.find((item) => item.commit_day === today);
  console.log('existingRecord.commit_day', existingRecord);
  console.log('existingRecord.commit_count', existingRecord?.commit_count);
  console.log('today', today);
  console.log('commitCount', commitCount);

  if (existingRecord) {
    // DB 업데이트

    console.log(' DB 업데이트');
    const updatedCount = commitCount;

    await query({
      query:
        'UPDATE commit SET commit_count = ? WHERE id = ? AND commit_day = ?',
      values: [updatedCount, userId, today],
    });

    console.log(`${today}에 대한 기존 레코드를 업데이트했습니다.`);
  } else {
    // DB 저장
    console.log(' DB 저장');
    await query({
      query:
        'INSERT INTO commit (id, commit_day, commit_count) VALUES (?, ?, ?)',
      values: [userId, today, commitCount],
    });
  }
};
