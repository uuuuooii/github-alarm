import { NextResponse, NextRequest } from 'next/server';
import { query } from '../../../lib/db';

export const GET = async (request: NextRequest, response: NextResponse) => {
  try {
    // 개인 정보
    // 가정: 특정 사용자의 ID를 사용하여 commit_count 조회
    const userId = 97392254; // 사용자 ID

    // Authorization 헤더를 가져오기
    const authorizationHeader = request.headers.get('Authorization');

    if (!authorizationHeader) {
      return new NextResponse('Authorization header is missing', {
        status: 401,
      });
    }

    const data = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: authorizationHeader,
      },
    });

    const json = await data.json();

    if (!userId) {
      // DB 저장
      await query({
        query: 'INSERT INTO users (id, username, nickname) VALUES (?, ?, ?)',
        values: [json.id, json.name, json.login],
      });
    }

    // point 업데이트
    // 데이터베이스에서 point 조회
    let point = 0;

    const result = await query({
      query: 'SELECT point FROM point WHERE id = ?',
      values: [userId],
    });

    console.log(result);
    console.log(point);
    for (let i = 0; i < result.length; i++) {
      point += result[i].point;
    }
    console.log(point);

    await query({
      query: 'UPDATE users SET all_point = ? WHERE id = ?',
      values: [point, userId],
    });

    // 연속일 업데이트
    let maxConsecutiveDays = 0;

    const resultday = await query({
      query:
        'SELECT * FROM users JOIN commit ON users.id = commit.id WHERE users.id = ?',
      values: [userId],
    });
    console.log(resultday);
    for (let i = 0; i < resultday.length; i++) {
      if (resultday[i].commit_day && resultday[i].commit_count > 0) {
        maxConsecutiveDays += 1;
      }
    }
    console.log(maxConsecutiveDays);

    await query({
      query: 'UPDATE users SET max_consecutive_days = ? WHERE id = ?',
      values: [maxConsecutiveDays, userId],
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
