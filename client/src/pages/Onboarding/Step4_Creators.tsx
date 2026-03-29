import CreatorUpload from '../../components/CreatorUpload'

interface Props {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function Step4_Creators({ onNext, onBack, onSkip }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Add creator inspiration
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        Upload up to 10 screenshots from 2 LinkedIn creators you love.
        AI will blend their style into your daily posts.
      </p>

      <CreatorUpload onComplete={() => {}} />

      <div className="flex gap-3 mt-4">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          onClick={onSkip}
          className="flex-1 border border-gray-200 text-gray-500 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
        >
          Skip for now
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Continue
        </button>
      </div>
    </div>
  )
}