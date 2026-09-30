import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../store/sessionStore'
import { useApp } from '../../store/appStore'

/** Ensures a screening session with a patient exists; otherwise sends user to patient search. */
export function useScreeningPatient(requireJoint = false) {
  const nav = useNavigate()
  const s = useSession()
  const patient = useApp(st => st.patients.find(p => p.id === s.patientId))
  useEffect(() => { if (!patient) nav('/patients', { replace: true }); else if (requireJoint && !s.joint) nav('/screening/joint', { replace: true }) }, [patient, requireJoint, s.joint, nav])
  return { patient, session: s }
}
export const TOTAL_STEPS = 7
