import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useState } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar  from './components/Sidebar'
import Topbar   from './components/Topbar'

import Home       from './pages/Home'
import Login      from './pages/Login'
import Onboarding from './pages/Onboarding/index'
import Dashboard  from './pages/Dashboard'
import Generate   from './pages/Generate'
import News       from './pages/News'
import History    from './pages/History'
import Settings   from './pages/Settings'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/generate':  'Generate a post',
  '/news':      'News feed',
  '/history':   'My posts',
  '/settings':  'Settings',
}

function AppShell() {
  const location = useLocation()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const isPublic = ['/', '/login', '/onboarding'].includes(location.pathname) ||
    location.pathname.startsWith('/onboarding')

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }

  if (isPublic) {
    return (
      <div className={`theme-${theme}`}>
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/onboarding" element={
            <ProtectedRoute><Onboarding /></ProtectedRoute>
          } />
        </Routes>
      </div>
    )
  }

  const title = PAGE_TITLES[location.pathname] ?? 'PostDaily'

  return (
    <div className={`app-shell theme-${theme}`}>
      <Sidebar />
      <div className="main-area">
        <Topbar
          title={title}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/generate"  element={<ProtectedRoute><Generate /></ProtectedRoute>} />
          <Route path="/news"      element={<ProtectedRoute><News /></ProtectedRoute>} />
          <Route path="/history"   element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}