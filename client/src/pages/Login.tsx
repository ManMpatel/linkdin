import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // If already logged in — skip login page
  useEffect(() => {
    if (!loading && user) {
      navigate(user.isOnboarded ? '/dashboard' : '/onboarding')
    }
  }, [user, loading])

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">
        <div className="text-2xl font-bold text-blue-600 mb-1">PostDaily</div>
        <p className="text-gray-400 text-sm mb-8">Sign in to your account</p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-6 py-3 hover:bg-gray-50 transition font-medium text-gray-700"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <p className="text-gray-400 text-xs mt-6">
          By signing in you agree to our terms of service
        </p>
      </div>
    </div>
  )
}