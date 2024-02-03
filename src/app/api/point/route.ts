// 1. 사용자가 하루에 한 번이라도 커밋 하면 4포인트 지급
//  -> 만약 커밋이 있으면 +4
// 2. 사용자가 연속적으로 커밋 했을 떄 3일 째에 4포인트 추가로 지급
// 3. 사용자가 가구를 구매하면 포인트 차감

// 총 point는 api 호출시에 users 데이터에 업데이트

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
    console.log(result);

    let point = 0;
    let history;

    for (let i = 0; i < result.length; i++) {
      const commitCount = result[i].commit_count;
      const commitDay = result[i].commit_day;
      const timestampPoint = result[i].created_at.toLocaleDateString();

      // 하루 커밋 수가 1개 이상이면 4포인트 부여
      // 이미 오늘 4포인트를 받으면 안 줌
      const today = new Date().toLocaleDateString();

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
      query: 'INSERT INTO point (id, point, history) VALUES (?,?,?)',
      values: [userId, point, history],
    });

    // 연속 포인트 추가
    const resultday = (await query({
      query:
        'SELECT * FROM users JOIN commit ON users.id = commit.id WHERE users.id = ?',
      values: [userId],
    })) as ResultProps[];

    for (let i = 0; i < resultday.length; i++) {
      // 특정 일 이상 연속 커밋으로 추가 포인트 부여
      if (resultday[i].max_consecutive_days === 3) {
        point += 4;
      }
      if (resultday[i].max_consecutive_days === 7) {
        point += 8;
      }
      if (resultday[i].max_consecutive_days === 14) {
        point += 12;
      }
      if (resultday[i].max_consecutive_days === 21) {
        point += 16;
      }
      if (resultday[i].max_consecutive_days === 42) {
        point += 20;
      }
      if (resultday[i].max_consecutive_days === 66) {
        point += 36;
      }
    }

    return new NextResponse(JSON.stringify(point), { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
