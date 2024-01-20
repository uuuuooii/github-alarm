import { NextResponse, NextRequest } from 'next/server';

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

    return new NextResponse(JSON.stringify(json), { status: 200 });
  } catch (error) {
    console.log(error);
  }
};