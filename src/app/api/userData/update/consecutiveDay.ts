import { query } from '@/lib/db';

interface ResultPops {
  commit_day: string;
  commit_count: number;
}

export const updateConsecutiveDay = async (userId: number) => {
  let maxConsecutiveDays = 0;

  const result = (await query({
    query: `
    SELECT commit_day, commit_count
    FROM (
      SELECT
        commit_day,
        commit_count,
        ROW_NUMBER() OVER (PARTITION BY commit_day ORDER BY commit_count DESC) AS rnk
      FROM users
      JOIN commit ON users.id = commit.id
      WHERE users.id = ? AND commit_count >= 1
    ) AS ranked
    WHERE rnk = 1;
  `,
    values: [userId],
  })) as ResultPops[];
  console.log(result);
  for (let i = 0; i < result.length; i++) {
    if (result[i].commit_day && result[i].commit_count >= 1) {
      // console.log(result[i].commit_day);
      // console.log(result[i].commit_count >= 1);

      maxConsecutiveDays += 1;
    } else {
      maxConsecutiveDays = 0;
    }
  }

  await query({
    query: 'UPDATE users SET max_consecutive_days = ? WHERE id = ?',
    values: [maxConsecutiveDays, userId],
  });
};
