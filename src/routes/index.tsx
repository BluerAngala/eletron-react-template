import { createHashRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AiChat } from '@/pages/AiChat'
import { Home } from '@/pages/Home'
import { Logs } from '@/pages/Logs'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'ai', element: <AiChat /> },
      { path: 'logs', element: <Logs /> },
    ],
  },
])
