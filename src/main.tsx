import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const showBootstrapError = (title: string, details: string) => {
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML = `
    <div style="padding:16px;color:#fff;background:#0a0a0f;font-family:system-ui, sans-serif;min-height:100vh;">
      <h2 style="margin:0 0 12px;">${title}</h2>
      <pre style="white-space:pre-wrap;word-break:break-word;background:#111;padding:12px;border-radius:8px;">${details}</pre>
    </div>
  `
}

window.addEventListener('error', (event) => {
  const message = event.error?.stack || event.message || 'unknown bootstrap error'
  showBootstrapError('应用启动失败', String(message))
})

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason instanceof Error ? event.reason.stack || event.reason.message : String(event.reason)
  showBootstrapError('应用启动失败（Promise）', reason)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
