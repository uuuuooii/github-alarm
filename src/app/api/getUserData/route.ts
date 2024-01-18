import { NextResponse, NextRequest } from 'next/server';

export const GET = async (request: NextRequest, response: NextResponse) => {
  // Authorization 헤더를 가져오기
  const authorizationHeader = request.headers.get('Authorization');

  if (!authorizationHeader) {
    return new NextResponse('Authorization header is missing', { status: 401 });
  }

  await fetch('https://api.github.com/user', {
    method: 'GET',
    headers: {
      Authorization: authorizationHeader,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      return new NextResponse(data, { status: 200 });
    });
};
