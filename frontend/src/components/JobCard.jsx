import { MapPin, Building2, Clock, Wifi, ExternalLink } from 'lucide-react'

export default function JobCard({ job, onSelect, isSelected }) {
  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Recently'
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return `${Math.floor(days / 30)}mo ago`
  }

  return (
    <div
      onClick={() => onSelect(job)}
      className={`bg-card rounded-xl p-5 border cursor-pointer transition-all duration-200
        hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5
        ${isSelected ? 'border-accent shadow-lg shadow-accent/10' : 'border-border'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {job.logo ? (
            <img src={job.logo} alt={job.company}
              className="w-10 h-10 rounded-lg object-contain bg-white p-1"
              onError={e => e.target.style.display = 'none'}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center
              justify-center text-accent font-bold text-sm">
              {job.company?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <h3 className="text-white font-semibold text-sm leading-tight">
              {job.title}
            </h3>
            <p className="text-muted text-xs mt-0.5">{job.company}</p>
          </div>
        </div>
        {isSelected && (
          <div className="shrink-0 w-2 h-2 rounded-full bg-accent mt-1.5" />
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {job.location && (
          <span className="flex items-center gap-1 text-xs text-muted">
            <MapPin size={11} /> {job.location.split(',')[0]}
          </span>
        )}
        {job.is_remote && (
          <span className="flex items-center gap-1 text-xs text-success bg-success/10
            px-2 py-0.5 rounded-full">
            <Wifi size={11} /> Remote
          </span>
        )}
        {job.type && (
          <span className="text-xs text-muted bg-background px-2 py-0.5 rounded-full border border-border">
            {job.type}
          </span>
        )}
        <span className="flex items-center gap-1 text-xs text-muted ml-auto">
          <Clock size={11} /> {timeAgo(job.posted_at)}
        </span>
      </div>

      {/* Description preview */}
      <p className="text-muted text-xs leading-relaxed line-clamp-2">
        {job.description?.slice(0, 120)}...
      </p>

      {/* Salary */}
      {job.salary_min && (
        <p className="text-success text-xs font-medium mt-2">
          ${job.salary_min?.toLocaleString()} — ${job.salary_max?.toLocaleString()}
        </p>
      )}
    </div>
  )
}