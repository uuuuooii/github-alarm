import { query } from '@/lib/db';

interface ResultPops {
  commit_day: string;
  commit_count: number;
}

export const updateConsecutiveDay = async (userId: number) => {
  let maxConsecutiveDays = 0;

  const result = (await query({
    query: `
      SELECT commit_day, MAX(commit_count) AS commit_count
      FROM users
      JOIN commit ON users.id = commit.id
      WHERE users.id = ?
      GROUP BY commit_day;
  `,

    values: [userId],
  })) as ResultPops[];

  console.log(result);

  for (let i = 0; i < result.length; i++) {
    if (result[i].commit_count >= 1) {
      maxConsecutiveDays += 1;
    } else {
      maxConsecutiveDays = 0;
    }
  }

  await query({
    query: 'UPDATE users SET max_consecutive_days = ? WHERE id = ?',
    values: [maxConsecutiveDays, userId],
  });

  return { max_consecutive_days: maxConsecutiveDays };
};
