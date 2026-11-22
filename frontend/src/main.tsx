import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

/* ── أخفِ الـ boot splash بعد ما يرندر React ── */
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const splash = document.getElementById('boot-splash')
    if (splash) {
      splash.classList.add('hidden')
      // احذفه من الـ DOM بعد انتهاء الـ transition
      splash.addEventListener('transitionend', () => splash.remove(), { once: true })
    }
  })
})
