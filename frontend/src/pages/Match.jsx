import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

import config from '../config'
const API = config.API_URL

function ScoreBadge({ label }) {
  const colors = {
    high: 'bg-green-50 text-green-700',
    medium: 'bg-yellow-50 text-yellow-700',
    low: 'bg-gray-50 text-gray-500',
    unknown: 'bg-gray-50 text-gray-400'
  }
  const cls = colors[label] || colors.unknown
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  )
}

function DonorCard({ donor, rank }) {
  return (
    <div className={`bg-white border rounded-2xl p-6 transition-all ${rank === 0 ? 'border-blood-200 shadow-sm' : 'border-gray-100'}`}>

      {/* Top row — name + blood group */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${rank === 0 ? 'bg-blood-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
            {rank + 1}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{donor.name}</div>
            <div className="text-xs text-gray-400">{donor.city}</div>
          </div>
        </div>
        <div className={`text-lg font-bold px-3 py-1 rounded-lg ${rank === 0 ? 'bg-blood-50 text-blood-600' : 'bg-gray-50 text-gray-700'}`}>
          {donor.blood_group}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
        <div>
          <div className="text-xs text-gray-400 mb-1">Distance</div>
          <div className="text-sm font-semibold text-gray-900">{donor.distance_km} km</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">ML score</div>
          <div className="text-sm font-semibold text-gray-900">{(donor.response_probability * 100).toFixed(0)}%</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Likelihood</div>
          <ScoreBadge label={donor.score_label} />
        </div>
      </div>

      {/* Contact row */}
      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-1">Contact</div>
          <div className="text-sm font-semibold text-gray-900">{donor.phone}</div>
        </div>
        <a href={"tel:" + donor.phone} className="bg-blood-500 hover:bg-blood-600 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors">Call donor</a>
      </div>

      {/* Top match label */}
      {rank === 0 && (
        <div className="mt-4 pt-4 border-t border-gray-50">
          <span className="text-xs text-blood-500 font-medium">Top match — highest response probability</span>
        </div>
      )}
    </div>
  )
}

export default function Match() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [radius, setRadius] = useState(10)

  const fetchDonors = async (r = radius) => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/requests/${id}/nearby-donors?radius_km=${r}`)
      setData(res.data)
    } catch (e) {
      setError('Could not load donors. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDonors() }, [id])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blood-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">BloodNet</span>
        </button>
        <span className="text-sm text-gray-400">Match results</span>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Summary bar */}
        {data && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {data.donors_found} donor{data.donors_found !== 1 ? 's' : ''} found
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Blood group {data.blood_group} · within {data.search_radius_km} km ·{' '}
                  <span className={data.cache === 'hit' ? 'text-green-500' : 'text-gray-400'}>
                    cache {data.cache}
                  </span>
                </p>
              </div>
              <div className="text-2xl font-bold text-blood-500">{data.blood_group}</div>
            </div>

            {/* Radius selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Search radius:</span>
              {[5, 10, 20, 50].map(r => (
                <button
                  key={r}
                  onClick={() => { setRadius(r); fetchDonors(r) }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    radius === r
                      ? 'bg-blood-500 text-white border-blood-500'
                      : 'border-gray-200 text-gray-500 hover:border-blood-300'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-blood-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-400">Finding and scoring donors...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
            {error}
          </div>
        )}

        {/* No donors */}
        {!loading && data && data.donors_found === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No donors found nearby</h3>
            <p className="text-sm text-gray-400 mb-6">Try expanding the search radius</p>
            <button
              onClick={() => { setRadius(50); fetchDonors(50) }}
              className="bg-blood-500 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blood-600 transition-colors"
            >
              Search 50 km radius
            </button>
          </div>
        )}

        {/* Donor cards */}
        {!loading && data && data.donors.length > 0 && (
          <div className="space-y-4">
            {data.donors.map((donor, i) => (
              <DonorCard key={donor.id} donor={donor} rank={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}