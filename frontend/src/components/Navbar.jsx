import { Briefcase, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="glass sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-btn rounded-lg flex items-center justify-center">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">AI Job Hunter</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted border border-border
          px-3 py-1.5 rounded-full">
          <Zap size={12} className="text-accent" />
          Powered by LangGraph + Groq
        </div>
      </div>
    </nav>
  )
}