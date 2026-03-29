import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/generate',  icon: '✦', label: 'Generate' },
  { path: '/news',      icon: '◈', label: 'News feed', badge: 'New' },
  { path: '/history',   icon: '◷', label: 'History' },
]

const NAV2 = [
  { path: '/settings', icon: '◎', label: 'Settings' },
]

export default function Sidebar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useAuth()

  const isActive = (path: string) => location.pathname === path

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">P</div>
        <div className="logo-text">PostDaily</div>
      </div>

      {/* Main nav */}
      <div className="nav-section">
        <div className="nav-section-label">Workspace</div>
        {NAV.map(item => (
          <button
            key={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </button>
        ))}
      </div>

      {/* Account nav */}
      <div className="nav-section">
        <div className="nav-section-label">Account</div>
        {NAV2.map(item => (
          <button
            key={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* User card */}
      <div className="sidebar-footer">
        <div className="user-card" onClick={() => navigate('/settings')}>
          <div className="user-avatar">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} />
              : user?.name?.[0]?.toUpperCase()
            }
          </div>
          <div>
            <div className="user-name">{user?.name ?? 'User'}</div>
            <div className="user-plan">{user?.niche ?? 'Pro'} · {user?.region ?? 'AU'}</div>
          </div>
        </div>
      </div>

    </aside>
  )
}