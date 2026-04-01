import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

import config from '../config'
const API = config.API_URL

export default function Request() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    patient_name: '', hospital_name: '', blood_group: '',
    units_needed: '', latitude: '', longitude: '', city: '', urgency: 'normal'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleLocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      setForm(f => ({
        ...f,
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6)
      }))
    })
  }

  const handleSubmit = async () => {
    const required = ['patient_name','hospital_name','blood_group','units_needed','latitude','longitude','city']
    for (const f of required) {
      if (!form[f]) { setError(`Please fill in ${f.replace(/_/g,' ')}`); return }
    }
    setLoading(true)
    try {
      const res = await axios.post(`${API}/requests/`, {
        ...form,
        units_needed: parseFloat(form.units_needed),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude)
      })
      // Navigate to match results page with the new request ID
      navigate(`/match/${res.data.id}`)
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="border-b border-gray-100 px-6 h-14 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blood-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">BloodNet</span>
        </button>
        <span className="text-sm text-gray-400">Blood request</span>
      </div>

      <div className="max-w-lg mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="inline-block bg-blood-50 text-blood-600 text-xs font-medium px-3 py-1 rounded-full mb-4">
            Urgent request
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Request blood</h1>
          <p className="text-gray-400 text-sm">We'll find the nearest available donors with matching blood type instantly.</p>
        </div>

        <div className="space-y-4">

          {/* Patient + Hospital */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Patient name</label>
            <input
              name="patient_name" value={form.patient_name} onChange={handleChange}
              placeholder="Amit Kumar"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blood-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Hospital name</label>
            <input
              name="hospital_name" value={form.hospital_name} onChange={handleChange}
              placeholder="AIIMS Delhi"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blood-500 transition-colors"
            />
          </div>

          {/* Blood group */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Blood group needed</label>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map(bg => (
                <button
                  key={bg}
                  onClick={() => setForm(f => ({ ...f, blood_group: bg }))}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    form.blood_group === bg
                      ? 'bg-blood-500 text-white border-blood-500'
                      : 'border-gray-200 text-gray-600 hover:border-blood-300'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Units + Urgency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Units needed</label>
              <input
                name="units_needed" value={form.units_needed} onChange={handleChange}
                placeholder="2"
                type="number"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blood-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Urgency</label>
              <select
                name="urgency" value={form.urgency} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blood-500 transition-colors"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* City */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">City</label>
            <input
              name="city" value={form.city} onChange={handleChange}
              placeholder="Delhi"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blood-500 transition-colors"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Hospital location</label>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <input
                name="latitude" value={form.latitude} onChange={handleChange}
                placeholder="Latitude"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blood-500 transition-colors"
              />
              <input
                name="longitude" value={form.longitude} onChange={handleChange}
                placeholder="Longitude"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blood-500 transition-colors"
              />
            </div>
            <button
              onClick={handleLocate}
              className="text-xs text-blood-500 hover:text-blood-600 font-medium transition-colors"
            >
              Use current location
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blood-500 hover:bg-blood-600 disabled:opacity-50 text-white py-3.5 rounded-xl font-medium text-sm transition-colors mt-2"
          >
            {loading ? 'Finding donors...' : 'Find matching donors'}
          </button>

        </div>
      </div>
    </div>
  )
}