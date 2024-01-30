import { NextResponse, NextRequest } from 'next/server';
import { query } from '../../../lib/db';

export const GET = async (request: NextRequest, response: NextResponse) => {
  try {
    // Authorization 헤더를 가져오기
    const authorizationHeader = request.headers.get('Authorization');

    if (!authorizationHeader) {
      return new NextResponse('Authorization header is missing', {
        status: 401,
      });
    }

    // 개인 정보
    const data = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: authorizationHeader,
      },
    });

    const json = await data.json();

    // DB 저장
    await query({
      query:
        'INSERT INTO users (id, username, login, access_token) VALUES (?, ?, ?, ?)',
      values: [json.id, json.name, json.login, authorizationHeader],
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
