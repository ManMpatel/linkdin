import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="text-3xl font-bold text-blue-600 mb-2">PostDaily</div>
      <p className="text-gray-400 text-sm mb-12">
        Your LinkedIn post. Every day. On autopilot.
      </p>

      <h1 className="text-4xl font-bold text-gray-900 text-center max-w-lg leading-tight mb-4">
        Stop struggling with what to post on LinkedIn
      </h1>
      <p className="text-gray-500 text-center max-w-md mb-10">
        AI writes you a high-engagement LinkedIn post every morning —
        personalised to your niche, tone, and today's trending news.
        You just copy and paste.
      </p>

      <button
        onClick={() => navigate('/login')}
        className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition mb-4"
      >
        Get started free
      </button>
      <p className="text-gray-400 text-xs">No credit card required</p>

      <div className="flex gap-4 mt-12 flex-wrap justify-center">
        {[
          '✍️ AI writes your post daily',
          '📰 Based on today\'s news',
          '📋 Copy + paste to LinkedIn',
        ].map((f) => (
          <span key={f} className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full">
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}