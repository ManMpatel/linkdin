import { useState, useRef  } from 'react'
import api from '../api/axios'

interface Props {
  onComplete: (fingerprint: any) => void
  existingStyle?: any
}

export default function CreatorUpload({ onComplete, existingStyle }: Props) {
  const [creator1Images, setCreator1Images] = useState<File[]>([])
  const [creator2Images, setCreator2Images] = useState<File[]>([])
  const [creator1Text, setCreator1Text]     = useState('')
  const [creator2Text, setCreator2Text]     = useState('')
  const [loading, setLoading]               = useState(false)
  const [done, setDone]                     = useState(false)
  const [error, setError]                   = useState('')
  const [result, setResult]                 = useState<any>(existingStyle)

  const ref1 = useRef<HTMLInputElement | null>(null)
  const ref2 = useRef<HTMLInputElement | null>(null)

  const handleFiles = (
    files: FileList | null,
    setter: (f: File[]) => void,
    current: File[]
  ) => {
    if (!files) return
    const newFiles = Array.from(files).slice(0, 10 - current.length)
    setter([...current, ...newFiles])
  }

  const removeFile = (index: number, files: File[], setter: (f: File[]) => void) => {
    setter(files.filter((_, i) => i !== index))
  }

  const analyse = async () => {
    if (creator1Images.length === 0 && !creator1Text.trim()) {
      setError('Add at least 1 screenshot or post text for Creator 1')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()

      // Add creator 1 images (first 10 slots)
      creator1Images.forEach(f => formData.append('screenshots', f))

      // Add creator 2 images (next 10 slots)
      creator2Images.forEach(f => formData.append('screenshots', f))

      formData.append('creator1Text', creator1Text)
      formData.append('creator2Text', creator2Text)

      const { data } = await api.post('/creators/analyse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (data.success) {
        setResult(data.data)
        setDone(true)
        onComplete(data.data)
      }
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const ImageGrid = ({
    files, setter, inputRef, label
  }: {
    files: File[]
    setter: (f: File[]) => void
    inputRef: React.RefObject<HTMLInputElement | null>
    label: string
  }) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <span className="text-xs text-gray-400">{files.length}/10 screenshots</span>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {files.map((f, i) => (
          <div key={i} className="relative group">
            <img
              src={URL.createObjectURL(f)}
              className="w-full h-16 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={() => removeFile(i, files, setter)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              ×
            </button>
          </div>
        ))}

        {/* Add more button */}
        {files.length < 10 && (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full h-16 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-xl hover:border-blue-300 transition flex items-center justify-center"
          >
            +
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files, setter, files)}
      />
    </div>
  )

  return (
    <div className="space-y-4">

      {/* Result shown if already analysed */}
      {result && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-green-700 font-medium text-sm mb-1">
            ✅ Creator style saved
          </p>
          <p className="text-green-600 text-xs leading-relaxed">
            {result.summary}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {result.vibeKeywords?.map((k: string) => (
              <span key={k} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Creator 1 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">
          Creator 1
        </h3>
        <ImageGrid
          files={creator1Images}
          setter={setCreator1Images}
          inputRef={ref1}
          label="Upload screenshots (up to 10)"
        />
        <textarea
          value={creator1Text}
          onChange={e => setCreator1Text(e.target.value)}
          placeholder="Paste any post text from Creator 1 here (optional but helps accuracy)"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400 h-24"
        />
      </div>

      {/* Creator 2 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">
          Creator 2 <span className="text-gray-400 font-normal">(optional)</span>
        </h3>
        <ImageGrid
          files={creator2Images}
          setter={setCreator2Images}
          inputRef={ref2}
          label="Upload screenshots (up to 10)"
        />
        <textarea
          value={creator2Text}
          onChange={e => setCreator2Text(e.target.value)}
          placeholder="Paste any post text from Creator 2 here (optional)"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400 h-24"
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        onClick={analyse}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-40"
      >
        {loading
          ? '🔍 Analysing style...'
          : done
          ? '✅ Style saved — re-analyse'
          : '🔍 Analyse creator style'}
      </button>

      <p className="text-gray-400 text-xs text-center">
        This runs once. AI analyses tone, hooks, structure and saves your creator vibe.
      </p>
    </div>
  )
}