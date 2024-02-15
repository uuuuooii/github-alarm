import { query } from '@/lib/db';
import axios from 'axios';
import { NextResponse } from 'next/server';

export interface ExistingDataProps {
  commit_day: Date;
  commit_count: number;
}

export const getRepoData = async (
  userId: number,
  authorization: string | NextResponse<unknown>,
  json: any
) => {
  // 레포 정보
  const reposResponse = await fetch(
    `https://api.github.com/users/${json.login}/repos?per_page=100`,
    {
      method: 'GET',
      headers: {
        Authorization: String(authorization),
      },
    }
  );

  const repos = await reposResponse.json();

  let commitCount = 0;
  let today: string | Date = new Date().toLocaleDateString('ko-KR');

  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    // console.log(repo.name);
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
    // console.log(commitData);
    if (commitData.length === 0) {
      console.log(`저장소에 커밋이 없음: ${repo.name}`);
      continue; // 다음 저장소로 건너뛰기
    }

    // 오늘 날짜의 커밋 필터링
    const todayCommits = commitData.filter(
      (commit: { commit: { author: { date: string | number | Date } } }) => {
        const commitDate = new Date(
          commit.commit.author.date
        ).toLocaleDateString('ko-KR');
        today = new Date().toLocaleDateString('ko-KR');

        return commitDate === today;
      }
    );

    commitCount += todayCommits.length;
    // 레포지토리명과 오늘의 커밋 수 출력
    // console.log(`레포지토리: ${repo.name}, 오늘 커밋: ${todayCommits.length}`);
    // console.log(` 오늘 커밋 수: ${commitCount}`);
  }

  // 조회
  const existingData = (await query({
    query: 'SELECT commit_day, commit_count FROM commit WHERE id = ?',
    values: [userId],
  })) as ExistingDataProps[];

  // 첫 번째가 아니라 전체 확인 해야함
  const existingRecord = existingData.find((item) => item.commit_day === today);

  if (existingRecord) {
    // DB 업데이트
    console.log(' DB 업데이트');
    const updatedCount = commitCount;

    await query({
      query:
        'UPDATE commit SET commit_count = ? WHERE id = ? AND commit_day = ?',
      values: [updatedCount, userId, today],
    });
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
