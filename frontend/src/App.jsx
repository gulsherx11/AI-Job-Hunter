import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Results from './pages/Results'
import Navbar from './components/Navbar'

export default function App() {
  const [lightMode, setLightMode] = useState(() => (
    localStorage.getItem('jobify-theme') !== 'dark'
  ))

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', lightMode)
    localStorage.setItem('jobify-theme', lightMode ? 'light' : 'dark')
  }, [lightMode])

  return (
    <div className="app-shell min-h-screen bg-background">
      <Navbar lightMode={lightMode} onToggleTheme={() => setLightMode(value => !value)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </div>
  )
}