import { NextResponse, NextRequest } from 'next/server';
import { query } from '../../../lib/db';

export const GET = async (request: NextRequest, response: NextResponse) => {
  try {
    // Authorization 헤더를 가져오기
    const authorizationHeader = request.headers.get('Authorization');
    console.log(authorizationHeader);
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

    await query({
      query: 'INSERT INTO users (id, username) VALUES (?, ?)',
      values: [json.id, json.login],
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
