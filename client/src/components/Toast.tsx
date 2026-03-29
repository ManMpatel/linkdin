import { useEffect } from 'react'

interface Props {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

export default function Toast({ message, type, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [])

  const colors = {
    success: 'bg-green-600',
    error:   'bg-red-600',
    info:    'bg-blue-600',
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium`}>
      {message}
    </div>
  )
}