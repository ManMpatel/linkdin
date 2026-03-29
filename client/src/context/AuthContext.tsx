import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

interface IUser {
  _id: string
  name: string
  email: string
  avatar: string
  isOnboarded: boolean
  region: string
  timezone: string
  niche: string
  tone: string
  goal: string
  postTime: string
  currentStreak: number
  longestStreak: number
  followerCount: number
  globalAudience: boolean
}

interface AuthContextType {
  user: IUser | null
  loading: boolean
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refetchUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      if (data.success) setUser(data.data)
      else setUser(null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUser() }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refetchUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}