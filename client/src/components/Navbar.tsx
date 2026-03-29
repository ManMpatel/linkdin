import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const links = [
    { path: '/dashboard', label: '🏠', title: 'Home' },
    { path: '/generate',  label: '✍️', title: 'Generate' },
    { path: '/news',      label: '📰', title: 'News' },
    { path: '/history',   label: '💾', title: 'History' },
    { path: '/settings',  label: '⚙️', title: 'Settings' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-2xl mx-auto flex">
        {links.map(l => (
          <button
            key={l.path}
            onClick={() => navigate(l.path)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition ${
              location.pathname === l.path
                ? 'text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-lg">{l.label}</span>
            <span className="text-xs">{l.title}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}