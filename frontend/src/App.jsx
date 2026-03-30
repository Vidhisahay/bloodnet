import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Register from './pages/Register'
import Request from './pages/Request'
import Match from './pages/Match'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/request" element={<Request />} />
        <Route path="/match/:id" element={<Match />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App