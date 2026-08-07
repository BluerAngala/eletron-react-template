import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import ErrorBoundary from '@/components/ErrorBoundary'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { i18nReady } from '@/i18n'
import { router } from '@/routes'

import './index.css'

void i18nReady.then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>,
  )
})

postMessage({ payload: 'removeLoading' }, '*')
