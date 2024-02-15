import { updateNthDay } from './update/nthDay';
import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { updatePoint } from './update/point';
import { updateConsecutiveDay } from './update/consecutiveDay';
import { authorizationHeader } from '@/lib/utils/authorization';

interface ResultProps {
  id: number;
  name: string;
  nickname: string;
  nth_day: number;
  all_point: number;
  max_consecutive_days: number;
}

export const GET = async (request: NextRequest, response: NextResponse) => {
  try {
    // Authorization 헤더를 가져오기
    const authorization = await authorizationHeader(request);

    const data = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: String(authorization),
      },
    });
    const json = await data.json();

    // 커밋 기록 조회
    const resultUser = (await query({
      query: 'SELECT * FROM users WHERE id = ?',
      values: [json.id],
    })) as ResultProps[];

    const findId = resultUser.find((item) => item.id === Number(json.id));

    if (!findId) {
      // DB 저장
      await query({
        query: 'INSERT INTO users (id, username, nickname) VALUES (?, ?, ?)',
        values: [json.id, json.name, json.login],
      });
    }

    // 며칠 째인지 업데이트
    // const nthDay = await updateNthDay(Number(json.id));

    // point 업데이트
    const pointData = await updatePoint(Number(json.id));

    // 연속일 업데이트
    const maxDay = await updateConsecutiveDay(Number(json.id));

    // 클라이언트에 보내는 값
    const formattedUserData = {
      id: json.id,
      name: json.name,
      nickname: json.login,
      // nth_day: nthDay.nth_day,
      all_point: pointData.all_point,
      max_consecutive_days: maxDay.max_consecutive_days,
    };

    return new NextResponse(JSON.stringify(formattedUserData), {
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
