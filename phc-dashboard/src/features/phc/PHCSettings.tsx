import { WideShell } from '../../components/layout/WideShell'
import { useAuth } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { UserCircle, LogOut, Lock } from 'lucide-react'
import { phcApi } from '../../services/phcApi'

export default function PHCSettings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <WideShell title="Settings" subtitle="Manage your PHC account">
      <div className="max-w-[600px] space-y-6">
        <div className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border p-6">
          <div className="flex items-center gap-4 mb-6">
             <div className="h-16 w-16 bg-tint rounded-full flex items-center justify-center text-primary">
               <UserCircle size={32} />
             </div>
             <div>
               <h2 className="text-[18px] font-bold text-ink">{user?.name || 'Unknown User'}</h2>
               <p className="text-[13px] text-secondary">@{user?.username || 'unknown'}</p>
             </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-border">
             <div>
               <label className="text-[12px] font-semibold text-secondary uppercase tracking-wider">Role</label>
               <div className="mt-1 text-[14px] font-medium text-ink px-3 py-1.5 bg-[#F7FAFA] border border-border rounded-[8px] inline-flex">
                 {user?.role || 'Unknown'}
               </div>
             </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-border mt-4">
             <button onClick={async () => {
               if (!user?.username) return;
               const pwd = window.prompt('Enter new password:');
               if (!pwd) return;
               try {
                 await phcApi.changePassword(user.username, pwd);
                 alert('Password updated successfully.');
               } catch (err) {
                 alert('Failed to update password.');
               }
             }} className="w-full flex items-center justify-between p-3 rounded-[12px] border border-border hover:bg-gray-50 transition-colors">
               <div className="flex items-center gap-3 text-ink">
                 <div className="h-10 w-10 bg-tint rounded-[8px] flex items-center justify-center text-primary"><Lock size={18} /></div>
                 <span className="font-semibold text-[14px]">Change Password</span>
               </div>
             </button>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full h-12 bg-white border border-error/20 text-error-text font-semibold text-[14px] rounded-[12px] hover:bg-error-tint hover:border-error/30 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </WideShell>
  )
}
