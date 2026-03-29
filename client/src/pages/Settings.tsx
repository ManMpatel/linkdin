
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import CreatorUpload from '../components/CreatorUpload'
import { useEffect, useState , useRef } from 'react'
import api from '../api/axios'

const NICHES = ['AI', 'Fitness', 'Business', 'Startup', 'Finance', 'Marketing', 'Leadership', 'Tech', 'Other']
const TONES  = [
  { value: 'professional', label: '💼 Professional' },
  { value: 'bold',         label: '🔥 Bold' },
  { value: 'storytelling', label: '📖 Storytelling' },
  { value: 'casual',       label: '😊 Casual' },
]
const GOALS = [
  { value: 'clients',    label: '🤝 Get clients' },
  { value: 'followers',  label: '📈 Grow followers' },
  { value: 'brand',      label: '🌟 Build brand' },
  { value: 'visibility', label: '👀 Get visibility' },
]
const REGIONS = [
  { code: 'AU', label: '🇦🇺 Australia' },
  { code: 'US', label: '🇺🇸 United States' },
  { code: 'IN', label: '🇮🇳 India' },
  { code: 'GB', label: '🇬🇧 United Kingdom' },
  { code: 'SG', label: '🇸🇬 Singapore' },
  { code: 'CA', label: '🇨🇦 Canada' },
  { code: 'NZ', label: '🇳🇿 New Zealand' },
  { code: 'AE', label: '🇦🇪 UAE' },
]

export default function Settings() {
  const { user, refetchUser } = useAuth()

  const [niche, setNiche]       = useState(user?.niche ?? '')
  const [tone, setTone]         = useState(user?.tone ?? 'professional')
  const [goal, setGoal]         = useState(user?.goal ?? '')
  const [region, setRegion]     = useState(user?.region ?? 'AU')
  const [postTime, setPostTime] = useState(user?.postTime ?? '07:00')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [creatorStyle, setCreatorStyle] = useState<any>(null)
  const [showCreator, setShowCreator]   = useState(false)
  const [avatarFile, setAvatarFile]     = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar ?? '')
  const avatarRef = useRef<HTMLInputElement | null>(null)


  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }
  useEffect(() => {
  api.get('/creators')
    .then(r => {
      if (r.data.data?.[0]?.styleFingerprint) {
        setCreatorStyle(r.data.data[0].styleFingerprint)
      }
    })
    .catch(() => {})
}, [])

    const save = async () => {
    setSaving(true)
    try {
      let avatarBase64 = avatarPreview

      // Convert file to base64 if new file selected
      if (avatarFile) {
        avatarBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload  = () => resolve(reader.result as string)
          reader.readAsDataURL(avatarFile)
        })
      }

      await api.patch('/auth/profile', {
        niche, tone, goal, region, postTime,
        avatar: avatarBase64,
      })
      await refetchUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const logout = () => {
    window.location.href = 'http://localhost:5000/api/auth/logout'
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        {/* Profile */}
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

          {/* Avatar upload */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--indigo), #8b5cf6)',
              overflow: 'hidden', cursor: 'pointer', border: '3px solid var(--border)',
            }} onClick={() => avatarRef.current?.click()}>
              {avatarPreview
                ? <img src={avatarPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: 'white' }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
              }
            </div>
            {/* Edit overl  ay */}    
            <div
              onClick={() => avatarRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'var(--indigo)', border: '2px solid var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '11px',
              }}
            >
              ✎
            </div>
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '3px' }}>
              {user?.email}
            </div>
            <button
              onClick={() => avatarRef.current?.click()}
              style={{
                marginTop: '8px', fontSize: '11.5px', color: 'var(--indigo)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: 'var(--font-body)',
              }}
            >
              Upload photo →
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            {user?.avatar && (
              <img
                src={user.avatar}
                className="w-14 h-14 rounded-full"
              />
            )}
            <div>
              <div className="font-semibold text-gray-900">{user?.name}</div>
              <div className="text-gray-400 text-sm">{user?.email}</div>
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1 text-center">
              <div className="font-semibold text-gray-800">
                🔥 {user?.currentStreak ?? 0}
              </div>
              <div className="text-gray-400 text-xs">Current streak</div>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1 text-center">
              <div className="font-semibold text-gray-800">
                🏆 {user?.longestStreak ?? 0}
              </div>
              <div className="text-gray-400 text-xs">Best streak</div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <h2 className="font-semibold text-gray-800 mb-4">Preferences</h2>

          {/* Niche */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Niche
            </label>
            <div className="grid grid-cols-3 gap-2">
              {NICHES.map(n => (
                <button
                  key={n}
                  onClick={() => setNiche(n)}
                  className={`py-2 rounded-xl text-sm font-medium border transition ${
                    niche === n
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Tone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                    tone === t.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Goal
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map(g => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                    goal === g.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Region
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REGIONS.map(r => (
                <button
                  key={r.code}
                  onClick={() => setRegion(r.code)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                    region === r.code
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Post time */}
          <div className="mb-2">
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Daily post time
            </label>
            <input
              type="time"
              value={postTime}
              onChange={e => setPostTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Creator Style */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-800">Creator style</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {creatorStyle
                  ? 'Style fingerprint saved ✅'
                  : 'No creator style set yet'}
              </p>
            </div>
            <button
              onClick={() => setShowCreator(!showCreator)}
              className="text-blue-600 text-sm font-medium"
            >
              {showCreator ? 'Hide' : creatorStyle ? 'Update' : 'Add'}
            </button>
          </div>

          {creatorStyle && !showCreator && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-600 text-xs leading-relaxed">
                {creatorStyle.summary}
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {creatorStyle.vibeKeywords?.map((k: string) => (
                  <span key={k} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

        {showCreator && (
          <CreatorUpload
            existingStyle={creatorStyle}
            onComplete={(fp) => {
              setCreatorStyle(fp)
              setShowCreator(false)
            }}
          />
        )}
      </div>

        {/* Save button */}
        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-40 mb-4"
        >
          {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save changes'}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full border border-gray-200 text-gray-500 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition"
        >
          Log out
        </button>

      </div>
    </div>
  )
}