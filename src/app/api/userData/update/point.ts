import { query } from '@/lib/db';

interface ResultProps {
  point: number;
}

export const updatePoint = async (userId: number) => {
  let point = 0;

  const result = (await query({
    query: 'SELECT point FROM point WHERE id = ?',
    values: [userId],
  })) as ResultProps[];

  for (let i = 0; i < result.length; i++) {
    point += result[i].point;
  }

  await query({
    query: 'UPDATE users SET all_point = ? WHERE id = ?',
    values: [point, userId],
  });
};
