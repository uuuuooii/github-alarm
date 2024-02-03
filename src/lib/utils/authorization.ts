import { NextRequest, NextResponse } from 'next/server';

export const authorizationHeader = async (request: NextRequest) => {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return new NextResponse('Authorization header is missing', {
      status: 401,
    });
  }
  return authHeader;
};
