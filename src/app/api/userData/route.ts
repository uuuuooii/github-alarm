import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { updatePoint } from './update/point';
import { updateConsecutiveDay } from './update/consecutiveDay';
import { authorizationHeader } from '@/lib/utils/authorization';

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

    if (!json.id) {
      // DB 저장
      await query({
        query: 'INSERT INTO users (id, username, nickname) VALUES (?, ?, ?)',
        values: [json.id, json.name, json.login],
      });
    }

    // point 업데이트
    await updatePoint(userId);

    // 연속일 업데이트
    await updateConsecutiveDay(userId);

    return new NextResponse(JSON.stringify(json), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.log(error);
    return new NextResponse(JSON.stringify(error), { status: 500 });
  }
};
