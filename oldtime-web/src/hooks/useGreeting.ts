import { useState, useEffect } from 'react'

function getGreetingText(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，注意休息哦'
  if (hour < 9) return '早上好，新的一天开始了'
  if (hour < 12) return '上午好，今天有藏品要入馆吗？'
  if (hour < 14) return '中午好，休息一下吧'
  if (hour < 18) return '下午好，今天有藏品要入馆吗？'
  if (hour < 22) return '晚上好，把今天的故事珍藏起来吧'
  return '夜深了，注意休息哦'
}

export function useGreeting(): string {
  const [greeting, setGreeting] = useState(getGreetingText)

  useEffect(() => {
    // 每分钟更新一次
    const timer = setInterval(() => {
      setGreeting(getGreetingText())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  return greeting
}
