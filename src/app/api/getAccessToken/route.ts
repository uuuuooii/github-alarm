import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest, response: NextResponse) => {
  try {
    const requestUrl = await request.nextUrl;
    const code = requestUrl.searchParams.get('code');
    console.log('code:' + code);

    const baseUrl = 'https://github.com/login/oauth/access_token';
    const config = {
      client_id: process.env.GITHUB_CLIENT_ID || '',
      client_secret: process.env.GITHUB_CLIENT_SECRET || '',
      code: code || '',
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    console.log('Final URL:', finalUrl);

    const data = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    });

    const json = await data.json();
    console.log('GitHub API response:', json);

    return new NextResponse(JSON.stringify(json), {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.log(error);
  }
};