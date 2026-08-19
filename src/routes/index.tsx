import { createHashRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Home } from '@/pages/Home'
import { Settings } from '@/pages/Settings'
import { About } from '@/pages/About'
import { PluginMarket } from '@/pages/PluginMarket'
import { MyPlugins } from '@/pages/MyPlugins'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'plugin-market', element: <PluginMarket /> },
      { path: 'my-plugins', element: <MyPlugins /> },
      { path: 'settings', element: <Settings /> },
      { path: 'about', element: <About /> },
    ],
  },
])
