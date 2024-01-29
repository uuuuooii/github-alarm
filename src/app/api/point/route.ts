// 1. 사용자가 하루에 한 번이라도 커밋 하면 4포인트 지급
//  -> 만약 커밋이 있으면 +4
// 2. 사용자가 연속적으로 커밋 했을 떄 3일 째에 4포인트 추가로 지급
// 3. 사용자가 가구를 구매하면 포인트 차감

import { NextResponse, NextRequest } from 'next/server';
import { query } from '../../../lib/db';
import axios from 'axios';

export const GET = async (request: NextResponse, response: NextResponse) => {
  try {
    let commitCount = 0;
    let continuoDays = 0;
    let point = 0;

    const config = {
      headers: {
        Authorization: `Bearer ${'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'}`,
      },
    };

    const userResponse = await axios.get(
      `http://localhost:3000/api/getUserData`,
      config
    );
    const user = userResponse.data;
    // console.log('user', user);
    // 레포지토리 정보 가져오기
    const reposResponse = await fetch(
      `https://api.github.com/users/${user.login}/repos`
    );
    const repos = await reposResponse.json();
    // console.log('repos', repos);

    for (let i = 0; i < repos.length; i++) {
      const repo = repos[i];

      // 레포지토리별 커밋 정보 가져오기
      const commitsResponse = await axios.get(
        `https://api.github.com/repos/${'uuuuooii'}/${repo.name}/commits`
      );
      const commitData = commitsResponse.data;
      console.log('commitData', commitData);
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
          const today = new Date().toLocaleDateString();
          return commitDate === today;
        }
      );

      commitCount += Number(todayCommits.length);

      // 레포지토리명과 오늘의 커밋 수 출력
      console.log(
        `레포지토리: ${repo.name}, 오늘 커밋: ${todayCommits.length}`
      );
      console.log(` 오늘 커밋 수: ${commitCount}`);
    }

    // 하루 커밋 수가 1개 이상이면 4포인트 부여
    if (commitCount >= 1) {
      point += 4;
      continuoDays += 1;
    }

    // 특정 일 이상 연속 커밋으로 추가 포인트 부여
    if (continuoDays === 3) {
      point += 4;
    }
    if (continuoDays === 7) {
      point += 8;
    }
    if (continuoDays === 14) {
      point += 12;
    }
    if (continuoDays === 21) {
      point += 16;
    }
    if (continuoDays === 42) {
      point += 20;
    }
    if (continuoDays === 66) {
      point += 36;
    }

    return new NextResponse(point, { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
