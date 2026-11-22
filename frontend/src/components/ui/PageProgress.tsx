/**
 * PageProgress — شريط تقدم رفيع في أعلى الصفحة
 * يظهر عند كل navigation داخل التطبيق
 * نهج مشابه لـ YouTube / GitHub / Vercel
 */
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './PageProgress.css'

export function PageProgress() {
  const location   = useLocation()
  const [width, setWidth]   = useState(0)
  const [visible, setVisible] = useState(false)
  const timer1 = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timer2 = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timer3 = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // عند كل تغيير في الـ route: أطلق الشريط
    setWidth(0)
    setVisible(true)

    // ابدأ التقدم السريع إلى 85%
    timer1.current = setTimeout(() => setWidth(85), 20)

    // أكمل إلى 100% بسرعة
    timer2.current = setTimeout(() => setWidth(100), 320)

    // أخفي بعد الانتهاء
    timer3.current = setTimeout(() => {
      setVisible(false)
      setWidth(0)
    }, 580)

    return () => {
      timer1.current && clearTimeout(timer1.current)
      timer2.current && clearTimeout(timer2.current)
      timer3.current && clearTimeout(timer3.current)
    }
  }, [location.pathname])

  if (!visible) return null

  return (
    <div className="pp-track" aria-hidden="true">
      <div
        className="pp-bar"
        style={{ width: `${width}%`, opacity: width === 100 ? 0 : 1 }}
      />
      <div className="pp-glow" style={{ left: `${width}%` }} />
    </div>
  )
}
