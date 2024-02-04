//TODO: 하루 포인트 추가 되면 더 이상 포인트 추가 안 되게. 그리고 연속일 되면 추가 되게끔

import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';

interface ResultProps {
  commit_count: number;
  commit_day: string;
  created_at: Date;
  max_consecutive_days: number;
}

export const GET = async () => {
  try {
    // 가정: 특정 사용자의 ID를 사용하여 commit_count 조회
    const userId = 97392254; // 사용자 ID

    // 데이터베이스에서 commit_count 조회
    const result = (await query({
      query:
        'SELECT * FROM commit JOIN point ON commit.id = point.id WHERE commit.id = ?',
      values: [userId],
    })) as ResultProps[];
    // console.log(result);

    let point = 0;
    let history;
    let testDay = '2024. 2. 7.';
    const today = new Date().toLocaleDateString();

    for (let i = 0; i < result.length; i++) {
      const commitCount = result[i].commit_count;
      const commitDay = result[i].commit_day;
      const timestampPoint = result[i].created_at.toLocaleDateString();

      // 하루 커밋 수가 1개 이상이면 4포인트 부여
      // 이미 오늘 4포인트를 받으면 안 줌
      // console.log(today);
      if (today === commitDay && commitCount >= 1 && timestampPoint !== today) {
        point = 4;
        history = '매일 커밋';

        // 포인트가 이미 오늘 지급되었음을 표시하기 위해 타임스탬프 업데이트
        await query({
          query: 'UPDATE commit SET created_at = ? WHERE id = ?',
          values: [new Date(), userId],
        });
      } else if (timestampPoint === today && commitCount === 0) {
        point = 0;
        history = '없음';
      }
    }
    // DB 저장
    await query({
      query:
        'INSERT INTO point (id, payment_day, point, history) VALUES (?,?,?,?)',
      values: [userId, today, point, history],
    });

    // 연속 포인트 추가
    const resultday = (await query({
      query: 'SELECT max_consecutive_days FROM users WHERE id = ?',
      values: [userId],
    })) as ResultProps[];

    const test = resultday.map(
      (item: { max_consecutive_days: number }) => item.max_consecutive_days
    );

    console.log(test);

    // console.log(resultday[i]);
    // 특정 일 이상 연속 커밋으로 추가 포인트 부여
    if (test[0] === 3) {
      point = 4;
      history = '연속 3일차';
    }
    if (test[0] === 7) {
      console.log('연속 7일차');

      point = 8;
      history = '연속 7일차';
    }
    if (test[0] === 14) {
      point = 12;
      history = '연속 14일차';
    }
    if (test[0] === 21) {
      point = 16;
      history = '연속 21일차';
    }
    if (test[0] === 42) {
      point = 20;
      history = '연속 42일차';
    }

    if (test[0] === 66) {
      point = 36;
      history = '연속 66일차';
    }

    // DB 저장
    // await query({
    //   query:
    //     'INSERT INTO point (id, payment_day, point, history) VALUES (?,?,?,?)',
    //   values: [userId, today, point, history],
    // });

    return new NextResponse(JSON.stringify(point), { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
