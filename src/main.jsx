import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { init } from './store'
import { MotionConfig } from 'motion/react'
import App from './App'
import './tokens.css'
import './style.css'
import './v14.css'

registerSW({ immediate: true })
init().then(() => createRoot(document.getElementById('root')).render(<MotionConfig reducedMotion="user"><App /></MotionConfig>))
