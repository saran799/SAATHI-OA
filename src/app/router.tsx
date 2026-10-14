import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from 'react-router-dom'
import { useApp } from '../store/appStore'
import Login from '../features/auth/Login'
import Language from '../features/auth/Language'
import Dashboard from '../features/dashboard/Dashboard'
import PatientSearch from '../features/patients/PatientSearch'
import PatientForm from '../features/patients/PatientForm'
import PatientProfile from '../features/patients/PatientProfile'
import JointSelect from '../features/screening/JointSelect'
import Questionnaire from '../features/screening/Questionnaire'
import Instructions from '../features/screening/Instructions'
import SensorConnect from '../features/screening/SensorConnect'
import Calibration from '../features/screening/Calibration'
import Assessment from '../features/screening/Assessment'
import Analysis from '../features/screening/Analysis'
import Result from '../features/screening/Result'
import Guidance from '../features/screening/Guidance'
import Exercises from '../features/screening/Exercises'
import Report from '../features/reports/Report'
import Records from '../features/records/Records'
import Awareness from '../features/awareness/Awareness'
import Settings from '../features/settings/Settings'

function Protected() {
  const { authed, language } = useApp()
  if (!authed) return <Navigate to="/login" replace />
  if (!language) return <Navigate to="/language" replace />
  return <><ScrollRestoration /><Outlet /></>
}
function LangGate() { const authed = useApp(s => s.authed); return authed ? <Language /> : <Navigate to="/login" replace /> }

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/language', element: <LangGate /> },
  { element: <Protected />, children: [
    { path: '/', element: <Navigate to="/dashboard" replace /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/patients', element: <PatientSearch /> },
    { path: '/patients/new', element: <PatientForm /> },
    { path: '/patients/:id', element: <PatientProfile /> },
    { path: '/screening/joint', element: <JointSelect /> },
    { path: '/screening/questions', element: <Questionnaire /> },
    { path: '/screening/instructions', element: <Instructions /> },
    { path: '/screening/sensor', element: <SensorConnect /> },
    { path: '/screening/calibration', element: <Calibration /> },
    { path: '/screening/assessment', element: <Assessment /> },
    { path: '/screening/analysis', element: <Analysis /> },
    { path: '/screening/result', element: <Result /> },
    { path: '/screening/guidance', element: <Guidance /> },
    { path: '/screening/exercises', element: <Exercises /> },
    { path: '/records', element: <Records /> },
    { path: '/records/:id', element: <Report /> },
    { path: '/awareness', element: <Awareness /> },
    { path: '/settings', element: <Settings /> },
    { path: '/settings/language', element: <Language fromSettings /> },
    { path: '*', element: <Navigate to="/dashboard" replace /> },
  ] },
])
