'use client';

import React from 'react';

const Alarm = () => {
  const onClickSendNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted')
      new Notification('알림!!', {
        body: '알림 입니다.',
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