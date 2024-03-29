import { query } from '@/lib/db';

interface ResultPops {
  commit_day: string;
  commit_count: number;
}

export const updateConsecutiveDay = async (userId: number) => {
  let maxConsecutiveDays = 0;
  let diff;

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

  const reverseData = result.reverse();

  for (let i = 0; i < reverseData.length; i++) {
    if (reverseData.length > 1) {
      const oldDate = new Date(result[1].commit_day);
      const newDate = new Date(result[0].commit_day);

      diff = Math.abs(newDate.getTime() - oldDate.getTime());
      diff = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (diff >= 2) {
        maxConsecutiveDays = 0;
      } else {
        maxConsecutiveDays += 1;
      }
    } else {
      maxConsecutiveDays = 1;
    }
  }

  await query({
    query: 'UPDATE users SET max_consecutive_days = ? WHERE id = ?',
    values: [maxConsecutiveDays, userId],
  });

  return { max_consecutive_days: maxConsecutiveDays };
};
