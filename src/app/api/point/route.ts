// 1. 사용자가 하루에 한 번이라도 커밋 하면 4포인트 지급
//  -> 만약 커밋이 있으면 +4
// 2. 사용자가 연속적으로 커밋 했을 떄 3일 째에 4포인트 추가로 지급
// 3. 사용자가 가구를 구매하면 포인트 차감

import { NextResponse, NextRequest } from 'next/server';
import { query } from '../../../lib/db';

export const GET = async (request: NextResponse, response: NextResponse) => {
  try {
    // 가정: 특정 사용자의 ID를 사용하여 commit_count 조회
    const userId = 97392254; // 사용자 ID를 설정하세요.

    // 데이터베이스에서 commit_count 조회
    const result = await query({
      query: 'SELECT commit_count FROM users WHERE id = ?',
      values: [userId],
    });

    console.log(result);

    const commitCount = result[0].commit_count;
    let continuoDays = 0;
    let point = 0;

    // 하루 커밋 수가 1개 이상이면 4포인트 부여
    if (commitCount >= 1) {
      point += 4;
      continuoDays += 1;
    } else {
      continuoDays = 0;
    }

    // 특정 일 이상 연속 커밋으로 추가 포인트 부여
    if (continuoDays === 3) {
      point += 4;
    }
    if (continuoDays === 7) {
      point += 8;
    }
    if (continuoDays === 14) {
      point += 12;
    }
    if (continuoDays === 21) {
      point += 16;
    }
    if (continuoDays === 42) {
      point += 20;
    }
    if (continuoDays === 66) {
      point += 36;
    }

    // DB 저장
    await query({
      query: 'INSERT INTO point (continuou_days) VALUES (?)',
      values: [continuoDays],
    });

    return new NextResponse(point, { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
