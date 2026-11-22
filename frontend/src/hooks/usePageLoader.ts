/**
 * usePageLoader — يعرض skeleton قصير (ms) عند أول mount للصفحة.
 * يمثّل الـ latency الحقيقي لما يُستبدل بـ API call لاحقاً.
 */
import { useEffect, useState } from 'react'

export function usePageLoader(ms = 350): boolean {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(t)
  }, [ms])

  return loading
}
