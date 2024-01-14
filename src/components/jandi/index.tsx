import axios from 'axios';
import React, { useEffect } from 'react';

interface JandiProps {
  username: string;
  year?: number | 'last';
}


const Jandi = ({ username, year }: JandiProps) => {


  const onClickGetData = async () => {
    const API_URL = 'https://github-contributions-api.jogruber.de/v4/';
    const response = await axios.get(`${API_URL}${username}`);
    console.log(response.data);
  };
  return (
    <div onClick={onClickGetData}>Jandi</div>
  );
};

export default Jandi;