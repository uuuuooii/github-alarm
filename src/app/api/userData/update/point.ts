import { query } from '@/lib/db';

interface UpdatePointProps {
  userId: number;
}

export const UpdatePoint = async ({ userId }: UpdatePointProps) => {
  // point 업데이트
  // 데이터베이스에서 point 조회
  let point = 0;

  const result = await query({
    query: 'SELECT point FROM point WHERE id = ?',
    values: [userId],
  });

  console.log(result);
  console.log(point);
  for (let i = 0; i < result.length; i++) {
    point += result[i].point;
  }
  console.log(point);

  await query({
    query: 'UPDATE users SET all_point = ? WHERE id = ?',
    values: [point, userId],
  });
};
