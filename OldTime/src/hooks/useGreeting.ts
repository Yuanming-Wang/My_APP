import { useState, useEffect } from 'react';
import { getGreeting } from '../lib/utils';

export function useGreeting() {
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000); // 每分钟更新一次

    return () => clearInterval(interval);
  }, []);

  return greeting;
}
