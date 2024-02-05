// 최고 연속 커밋 기록은 api 호출 시에 users 데이터에 업데이트

import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { authorizationHeader } from '@/lib/utils/authorization';
import { getRepoData } from './repo';

interface commitDataProps {
  commit_day: Date;
  commit_count: number;
}

export const GET = async (request: NextRequest, response: NextResponse) => {
  try {
    // 개인 정보
    // 가정: 특정 사용자의 ID를 사용하여 commit_count 조회
    const userId = 97392254; // 사용자 ID

    // Authorization 헤더를 가져오기
    const authorization = await authorizationHeader(request);

    const data = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: String(authorization),
      },
    });

    const json = await data.json();

    // 레포 정보
    await getRepoData(authorization, json);

    // 클라이언트에 보내는 값
    const commitData = (await query({
      query: 'SELECT * FROM commit WHERE id = ?',
      values: [userId],
    })) as commitDataProps[];

    const formattedCommitData = commitData.map((commit) => ({
      commit_day: commit.commit_day,
      commit_count: commit.commit_count,
    }));
    const length = formattedCommitData.length;

    return new NextResponse(
      JSON.stringify({ data: formattedCommitData, length }),
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
