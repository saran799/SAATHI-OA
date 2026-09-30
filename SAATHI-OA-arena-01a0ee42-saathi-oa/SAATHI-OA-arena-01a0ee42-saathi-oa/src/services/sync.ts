/**
 * SIMULATED sync. No data leaves the device in this prototype.
 * Replace with a real API client later.
 */
export type SyncStatus = 'offline' | 'local' | 'syncing' | 'synced' | 'failed'
export function simulateSync(onDone: (ok: boolean) => void, opts?: { fail?: boolean }) {
  const id = setTimeout(() => onDone(!opts?.fail), 1800)
  return () => clearTimeout(id)
}
