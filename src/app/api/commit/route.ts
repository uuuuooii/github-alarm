import { NextResponse, NextRequest } from 'next/server';
import { query } from '../../../lib/db';
import axios from 'axios';

export const GET = async (request: NextRequest, response: NextResponse) => {
  try {
    // Authorization 헤더를 가져오기
    // const authorizationHeader = request.headers.get('Authorization');

    // if (!authorizationHeader) {
    //   return new NextResponse('Authorization header is missing', {
    //     status: 401,
    //   });
    // }
    // 가정: 특정 사용자의 ID를 사용하여 commit_count 조회
    const userId = 97392254; // 사용자 ID

    // 데이터베이스에서 access_token 조회
    const result = await query({
      query: 'SELECT access_token FROM users WHERE id = ?',
      values: [userId],
    });

    const accessToken = result[0]?.access_token;

    // 개인 정보
    const data = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: accessToken,
      },
    });

    const json = await data.json();

    // 레포 정보
    const reposResponse = await fetch(
      `https://api.github.com/users/${json.login}/repos`,
      {
        method: 'GET',
        headers: {
          Authorization: accessToken,
        },
      }
    );

    const repos = await reposResponse.json();
    let commitCount = 0;
    let today;

    for (let i = 0; i < repos.length; i++) {
      const repo = repos[i];

      // 레포지토리별 커밋 정보 가져오기
      const commitsResponse = await axios.get(
        `https://api.github.com/repos/${json.login}/${repo.name}/commits`,
        {
          method: 'GET',
          headers: {
            Authorization: accessToken,
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
          today = new Date().toLocaleDateString();
          console.log(today);
          return commitDate === today;
        }
      );

      commitCount += todayCommits.length;

      // 레포지토리명과 오늘의 커밋 수 출력
      // console.log(
      //   `레포지토리: ${repo.name}, 오늘 커밋: ${todayCommits.length}`
      // );
      // console.log(` 오늘 커밋 수: ${commitCount}`);
    }

    // DB 저장
    await query({
      query: 'INSERT INTO commit ( commit_day, commit_count) VALUES ( ?, ?)',
      values: [today, commitCount],
    });

    return new NextResponse(JSON.stringify(json), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
