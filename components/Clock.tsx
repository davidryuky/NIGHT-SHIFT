import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="font-mono text-neon-green text-xl md:text-2xl tracking-widest opacity-80 drop-shadow-[0_0_2px_rgba(128,128,128,0.2)]">
      {formatTime(time)}
    </div>
  );
};

export default Clock;