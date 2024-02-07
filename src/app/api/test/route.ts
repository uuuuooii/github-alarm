import axios from 'axios';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const res = await axios.get('http://aben-admin.weballin.com/test.php');

  console.log(res.data);

  return new NextResponse(res.data, { status: 200 });
};
