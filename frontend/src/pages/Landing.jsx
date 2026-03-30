import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const NAV_LINKS = ['How it works', 'For donors', 'For hospitals', 'API']

const STATS = [
  { value: '8', label: 'Blood types matched' },
  { value: '10km', label: 'Default search radius' },
  { value: '92%', label: 'ML model accuracy' },
  { value: '<300ms', label: 'Avg response time' },
]

const FEATURES = [
  {
    tag: 'GEOSPATIAL',
    title: 'Find donors within kilometers, not cities',
    desc: 'PostGIS-powered search calculates real earth distances. Every result is sorted by proximity and ML-predicted response probability.',
    color: 'bg-blood-500',
  },
  {
    tag: 'ML SCORING',
    title: 'Not just nearby — most likely to respond',
    desc: 'XGBoost model trained on donation history, availability, and distance predicts which donor will actually show up.',
    color: 'bg-gray-900',
  },
  {
    tag: 'CACHING',
    title: 'Redis-powered instant repeat searches',
    desc: 'Search results cached with 5-minute TTL. Cache hit or miss shown transparently. Built for speed at scale.',
    color: 'bg-blood-600',
  },
]

const STEPS = [
  { num: '01', title: 'Hospital creates request', desc: 'Blood group, location, urgency level. Saved instantly to PostgreSQL.' },
  { num: '02', title: 'PostGIS finds nearby donors', desc: 'ST_DWithin queries donors within radius using real spherical geometry.' },
  { num: '03', title: 'ML service scores each donor', desc: 'XGBoost predicts response probability. Results re-ranked by likelihood.' },
  { num: '04', title: 'Ranked list returned', desc: 'Top donors shown with distance, score, and availability status.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(r => r.json())
      .then(d => setApiStatus(d.database === 'connected' ? 'online' : 'degraded'))
      .catch(() => setApiStatus('offline'))
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blood-500 rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-full" />
            </div>
            <span className="font-semibold text-gray-900 tracking-tight">BloodNet</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a key={l} href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/register')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Register as donor
            </button>
            <button
              onClick={() => navigate('/request')}
              className="text-sm bg-blood-500 hover:bg-blood-600 text-white px-4 py-2 rounded-full transition-colors"
            >
              Request blood
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-500' : apiStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-400'}`} />
            <span className="text-xs text-gray-400 uppercase tracking-widest">
              {apiStatus === 'online' ? 'System online' : apiStatus === 'offline' ? 'System offline' : 'Checking status...'}
            </span>
          </div>

          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
              Intelligent blood
              <br />
              donor matching
              <span className="text-blood-500">.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
              Geospatial search + machine learning. Find the right donor,
              in the right place, at the right time.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/request')}
                className="bg-blood-500 hover:bg-blood-600 text-white px-8 py-3.5 rounded-full font-medium transition-colors text-sm"
              >
                Request blood now
              </button>
              <button
                onClick={() => navigate('/register')}
                className="border border-gray-200 hover:border-gray-400 text-gray-700 px-8 py-3.5 rounded-full font-medium transition-colors text-sm"
              >
                Become a donor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-gray-900 tracking-tight">{s.value}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-xs text-blood-500 uppercase tracking-widest mb-3 font-medium">How it works</p>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">From request to match in seconds</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gray-100 -translate-y-1/2 z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-xs font-mono text-blood-500 mb-4">{s.num}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-snug">{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-xs text-blood-500 uppercase tracking-widest mb-3 font-medium">Core features</p>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Built for real emergencies</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-8 border border-gray-100">
                <span className={`inline-block text-xs font-mono text-white px-3 py-1 rounded-full mb-6 ${f.color}`}>
                  {f.tag}
                </span>
                <h3 className="font-semibold text-gray-900 mb-3 leading-snug">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-blood-500 rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Every second matters.
            </h2>
            <p className="text-blood-100 mb-10 text-lg">
              Register as a donor or find blood now.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-blood-600 hover:bg-blood-50 px-8 py-3.5 rounded-full font-medium transition-colors text-sm"
              >
                Register as donor
              </button>
              <button
                onClick={() => navigate('/request')}
                className="border border-white/30 text-white hover:bg-white/10 px-8 py-3.5 rounded-full font-medium transition-colors text-sm"
              >
                Request blood
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blood-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="text-sm font-semibold text-gray-900">BloodNet</span>
          </div>
          <p className="text-xs text-gray-400">Built with FastAPI · PostgreSQL · PostGIS · XGBoost · Redis · React</p>
        </div>
      </footer>

    </div>
  )
}