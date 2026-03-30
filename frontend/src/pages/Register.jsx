import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

const API = 'http://localhost:8000'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    blood_group: '', latitude: '', longitude: '', city: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
    const required = ['name','email','phone','blood_group','latitude','longitude','city']
    for (const f of required) {
      if (!form[f]) { setError(`Please fill in ${f.replace('_',' ')}`); return }
    }
    setLoading(true)
    try {
      await axios.post(`${API}/donors/register`, {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude)
      })
      setSuccess(true)
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-8 h-8 bg-green-500 rounded-full" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">You're registered!</h2>
        <p className="text-gray-400 mb-8">Thank you for joining BloodNet. You'll be notified when someone nearby needs your blood type.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blood-500 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-blood-600 transition-colors"
        >
          Back to home
        </button>
      </div>
    </div>
  )

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
        <span className="text-sm text-gray-400">Donor registration</span>
      </div>

      <div className="max-w-lg mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Register as a donor</h1>
          <p className="text-gray-400 text-sm">Your information helps us match you with patients who need your blood type nearby.</p>
        </div>

        <div className="space-y-4">

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Full name</label>
            <input
              name="name" value={form.name} onChange={handleChange}
              placeholder="Priya Sharma"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blood-500 transition-colors"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Email</label>
              <input
                name="email" value={form.email} onChange={handleChange}
                placeholder="priya@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blood-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Phone</label>
              <input
                name="phone" value={form.phone} onChange={handleChange}
                placeholder="9876543210"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blood-500 transition-colors"
              />
            </div>
          </div>

          {/* Blood group */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Blood group</label>
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
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Location</label>
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
              Use my current location
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
            {loading ? 'Registering...' : 'Register as donor'}
          </button>

        </div>
      </div>
    </div>
  )
}