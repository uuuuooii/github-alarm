'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [username, setUsername] = useState<string>('');
  const [data, setData] = useState();
  // console.log(data);
  // console.log(username);



  const getData = async () => {
    const token = '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';
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const userResponse = await axios.get(`https://api.github.com/users/${username}`);
      const user = userResponse.data;
      console.log(userResponse);


    } catch (err) {
      console.log(err);
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    getData();
  };


  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <form onSubmit={onSubmit}>
      <input type="text" value={username} onChange={onChangeInput} />
    </form>
  );
}
