import { query } from '@/lib/db';

interface ResultPops {
  created_at: string;
  updated_at: string;
}

export const updateNthDay = async (userId: number) => {
  let day = 0;

  const result = (await query({
    query: 'SELECT created_at, updated_at FROM users WHERE id = ?',
    values: [userId],
  })) as ResultPops[];

  const createDay = new Date(result[0].created_at);
  const updateDay = new Date(result[0].updated_at);

  const formattedCreateDate = createDay.toLocaleDateString('ko-KR', {
    timeZone: 'UTC',
  });
  const formattedUpdateDate = updateDay.toLocaleDateString('ko-KR', {
    timeZone: 'UTC',
  });

  const oldDate = new Date(formattedCreateDate);
  const newDate = new Date(formattedUpdateDate);

  let diff = Math.abs(newDate.getTime() - oldDate.getTime());
  diff = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (diff == 0) {
    day++;
  } else {
    day = diff + 1;
  }

  await query({
    query: 'UPDATE users SET nth_day = ?  WHERE id = ?',
    values: [day, userId],
  });

  return { nth_day: day };
};
