import { createHashRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { featureRoutes } from '@/features/renderer'
import { Home } from '@/pages/Home'
import { Logs } from '@/pages/Logs'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      ...featureRoutes,
      { path: 'logs', element: <Logs /> },
    ],
  },
])
