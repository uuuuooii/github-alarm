import { query } from '@/lib/db';
//TODO: 하루 포인트 추가 되면 더 이상 포인트 추가 안 되게. 그리고 연속일 되면 추가 되게끔

import { NextResponse, NextRequest } from 'next/server';

interface ResultProps {
  commit_count: number;
  commit_day: string;
  created_at: Date;
  max_consecutive_days: number;
  payment_day: string;
}

export const GET = async (request: NextRequest) => {
  try {
    const requestUrl = new URL(request.nextUrl);
    const userId = requestUrl.searchParams.get('id');

    const today = new Date().toLocaleDateString('ko-KR', {
      timeZone: 'Asia/Seoul',
    });

    // 커밋 기록 조회
    const resultCommit = (await query({
      query:
        'SELECT * FROM commit JOIN point ON commit.id = point.id WHERE commit.id = ?',
      values: [userId],
    })) as ResultProps[];

    // 최대 연속일 조회
    const resultMaxDay = (await query({
      query: 'SELECT max_consecutive_days FROM users WHERE id = ?',
      values: [userId],
    })) as ResultProps[];

    const maxConsecutiveDays = resultMaxDay[0].max_consecutive_days;

    let point = 0;
    let history;

    // 오늘 커밋 기록 확인
    const existingRecord = resultCommit.find(
      (item) => item.commit_day === today
    );

    // 하루 커밋 수가 1개 이상이면 4포인트 부여
    if (existingRecord && existingRecord.commit_count >= 1) {
      point = 4;
      history = '매일 커밋';
    } else {
      point = 0;
      history = '커밋 없음';
    }

    // 특정 일 이상 연속 커밋으로 추가 포인트 부여
    const array = [3, 7, 14, 21, 42, 66];
    const arrayPoint = [4, 8, 12, 16, 20, 36];

    for (let i = 0; i < array.length; i++) {
      if (array[i] === maxConsecutiveDays) {
        point += arrayPoint[i] + 4;
        history = `매일 커밋 + 연속${maxConsecutiveDays}일차  `;
      }
    }

    // 포인트 기록 저장
    if (existingRecord) {
      // DB 업데이트
      console.log(' DB 업데이트');
      await query({
        query:
          'UPDATE point SET point = ?, history = ? WHERE id = ? AND payment_day = ?',
        values: [point, history, userId, today],
      });
    } else {
      // DB 저장
      console.log('DB 저장');
      await query({
        query:
          'INSERT INTO point (id, payment_day, point, history) VALUES (?,?,?,?)',
        values: [userId, today, point, history],
      });
    }

    // 클라이언트에 보내는 값
    const formattedPoint = {
      point: point,
      history: history,
    };

    return new NextResponse(JSON.stringify(formattedPoint), { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse(JSON.stringify(error), { status: 500 });
  }
};
