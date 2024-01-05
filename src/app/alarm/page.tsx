'use client';

import React from 'react';

const Alarm = () => {
  const onClickSendNotification = () => {
    console.log('ss');
    if ('Notification' in window && Notification.permission === 'granted')
      new Notification('Hello Developers!!', {
        body: 'This is your notification message',
        icon: '/알림.png'
      });
  };

  return (
    <div>Alarm
      <button
        onClick={() => onClickSendNotification()}>
        Notification
      </button>
    </div>
  );
};

export default Alarm;