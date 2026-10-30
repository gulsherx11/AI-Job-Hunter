import { Briefcase, Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Navbar({ lightMode, onToggleTheme }) {
  return (
    <nav className="glass sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-btn rounded-md flex items-center justify-center">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Jobify</span>
        </Link>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={lightMode ? 'Switch to dark mode' : 'Switch to light mode'}
          title={lightMode ? 'Switch to dark mode' : 'Switch to light mode'}
          className="w-9 h-9 rounded-md border border-border text-muted hover:text-accent
          hover:border-accent transition-colors flex items-center justify-center"
        >
          {lightMode ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </nav>
  )
}