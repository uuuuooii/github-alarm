// 1. 사용자가 하루에 한 번이라도 커밋 하면 4포인트 지급
//  -> 만약 커밋이 있으면 +4
// 2. 사용자가 연속적으로 커밋 했을 떄 3일 째에 4포인트 추가로 지급
// 3. 사용자가 가구를 구매하면 포인트 차감

import { NextResponse, NextRequest } from 'next/server';
import { query } from '../../../lib/db';

export const GET = async (request: NextResponse, response: NextResponse) => {
  try {
    let commit = 1;
    let continuoDays = 3;
    let point = 0;

    // 하루 커밋 수가 1개 이상이면 4포인트 부여
    if (commit >= 1) {
      point += 4;
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

    return new NextResponse(point, { status: 200 });
  } catch {
    console.log(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
