import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { useAuth } from './store/authStore'

import PHCDashboard from './features/phc/PHCDashboard'
import PHCPatients from './features/phc/PHCPatients'
import PHCScreenings from './features/phc/PHCScreenings'
import PHCFollowUps from './features/phc/PHCFollowUps'
import PHCWorkers from './features/phc/PHCWorkers'
import PHCReports from './features/phc/PHCReports'
import PHCReportDetail from './features/phc/PHCReportDetail'
import PHCSync from './features/phc/PHCSync'
import PHCCommunity from './features/phc/PHCCommunity'
import PHCSettings from './features/phc/PHCSettings'
import PHCAnalytics from './features/phc/PHCAnalytics'
import Login from './features/auth/Login'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'PHC_ADMIN' && user?.role !== 'PHC_OFFICER') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/dashboard', element: <ProtectedRoute><PHCDashboard /></ProtectedRoute> },
  { path: '/analytics', element: <ProtectedRoute><PHCAnalytics /></ProtectedRoute> },
  { path: '/patients', element: <ProtectedRoute><PHCPatients /></ProtectedRoute> },
  { path: '/screenings', element: <ProtectedRoute><PHCScreenings /></ProtectedRoute> },
  { path: '/follow-ups', element: <ProtectedRoute><PHCFollowUps /></ProtectedRoute> },
  { path: '/workers', element: <ProtectedRoute><PHCWorkers /></ProtectedRoute> },
  { path: '/reports', element: <ProtectedRoute><PHCReports /></ProtectedRoute> },
  { path: '/reports/:id', element: <ProtectedRoute><PHCReportDetail /></ProtectedRoute> },
  { path: '/community', element: <ProtectedRoute><PHCCommunity /></ProtectedRoute> },
  { path: '/sync', element: <ProtectedRoute><PHCSync /></ProtectedRoute> },
  { path: '/settings', element: <ProtectedRoute><PHCSettings /></ProtectedRoute> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
