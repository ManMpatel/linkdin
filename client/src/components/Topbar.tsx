import { useAuth } from '../context/AuthContext'

interface Props {
  title: string
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Topbar({ title, theme, onToggleTheme }: Props) {
  const { user } = useAuth()

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-right">
        {/* Streak */}
        {(user?.currentStreak ?? 0) > 0 && (
          <div className="streak-pill">
            🔥 {user?.currentStreak} day streak
          </div>
        )}

        {/* Theme toggle */}
        <div className="theme-toggle">
          <button
            className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => theme !== 'light' && onToggleTheme()}
          >
            ☀ Light
          </button>
          <button
            className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => theme !== 'dark' && onToggleTheme()}
          >
            ◑ Dark
          </button>
        </div>
      </div>
    </header>
  )
}