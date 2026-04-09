import '@citron-systems/citron-ds/css'
import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import TasksManager from './exposes/TasksManager'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TasksManager />
    </BrowserRouter>
  </StrictMode>
)
