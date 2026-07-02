import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import JobCard from '../components/JobCard'
import FileUpload from '../components/FileUpload'
import StepProgress from '../components/StepProgress'
import {
  Search, MapPin, Wifi, Loader2,
  Briefcase, Zap, ChevronRight, FileText, Mail, Globe, Brain
} from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_API_URL
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [resume, setResume] = useState(null)
  const [location, setLocation] = useState('Pakistan')
  const [searchQuery, setSearchQuery] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [generationComplete, setGenerationComplete] = useState(false)
  const [generationData, setGenerationData] = useState(null)

  const handleSearch = async () => {
    setHasSearched(true)
    await loadJobs()
  }

  const handleViewResults = () => {
    navigate('/results', { state: generationData })
  }

  const handleRestart = () => {
    setGenerating(false)
    setGenerationComplete(false)
    setGenerationData(null)
    setCurrentStep(0)
    setSelectedJob(null)
    setResume(null)
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredJobs(jobs)
    } else {
      setFilteredJobs(jobs.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.company.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    }
  }, [searchQuery, jobs])

  const loadJobs = async () => {
    setLoadingJobs(true)
    setError(null)
    try {
      const res = await axios.get(`${apiUrl}/api/jobs`, {
        params: { location, remote: remoteOnly }
      })
      setJobs(res.data.jobs)
      setFilteredJobs(res.data.jobs)
    } catch (err) {
      setError('Failed to fetch jobs. Make sure backend is running.')
    }
    setLoadingJobs(false)
  }

  const handleGenerate = async () => {
    if (!selectedJob || !resume) return

    setGenerating(true)
    setCurrentStep(1)
    setError(null)

    // Simulate step progress
    const interval = setInterval(() => {
      setCurrentStep(prev => prev < 5 ? prev + 1 : prev)
    }, 10000)

    try {
      const formData = new FormData()
      formData.append('job_id', selectedJob.id)
      formData.append('job_title', selectedJob.title)
      formData.append('job_company', selectedJob.company)
      formData.append('job_location', selectedJob.location)
      formData.append('job_description', selectedJob.description)
      formData.append('job_apply_link', selectedJob.apply_link || '')
      formData.append('resume_pdf', resume)

      const res = await axios.post(`${apiUrl}/api/generate`, formData)
      clearInterval(interval)
      setCurrentStep(5)
      
      // Store results and mark generation as complete
      setGenerationData(res.data)
      setGenerationComplete(true)

    } catch (err) {
      clearInterval(interval)
      setError('Generation failed. Please try again.')
    }

    setGenerating(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          Find Jobs. Apply with{' '}
          <span className="gradient-text">AI Agents.</span>
        </h1>
        <p className="text-muted text-xl max-w-2xl mx-auto">
          Browse real jobs from LinkedIn & Indeed. One click generates a tailored
          resume, cover letter, and interview prep — automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Job List */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Filters */}
          <div className="glass rounded-xl p-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-48 bg-background
              border border-border rounded-lg px-3 py-2">
              <Search size={15} className="text-muted shrink-0" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="bg-transparent text-white text-sm placeholder:text-muted
                focus:outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2 bg-background border border-border
              rounded-lg px-3 py-2">
              <MapPin size={15} className="text-muted" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location"
                className="bg-transparent text-white text-sm placeholder:text-muted
                focus:outline-none w-28"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer px-3 py-2
              bg-background border border-border rounded-lg">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={e => setRemoteOnly(e.target.checked)}
                className="accent-accent"
              />
              <Wifi size={14} className="text-muted" />
              <span className="text-sm text-muted">Remote</span>
            </label>
            <button
              onClick={handleSearch}
              disabled={loadingJobs}
              className="gradient-btn text-white text-sm px-4 py-2 rounded-lg
              flex items-center gap-2"
            >
              {loadingJobs
                ? <Loader2 size={14} className="animate-spin" />
                : <Search size={14} />
              }
              {loadingJobs ? 'Loading...' : 'Search Jobs'}
            </button>
          </div>

          {/* Results count */}
          {!loadingJobs && hasSearched && (
            <p className="text-muted text-sm px-1">
              {filteredJobs.length} jobs found
              {selectedJob && (
                <span className="text-accent ml-2">
                  • 1 selected
                </span>
              )}
            </p>
          )}

          {/* Job Cards */}
          {loadingJobs ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-accent" />
                <p className="text-muted text-sm">Fetching jobs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-danger/10 border border-danger/30 text-danger
              rounded-xl p-5 text-sm">
              {error}
            </div>
          ) : !hasSearched ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Search size={40} className="text-muted opacity-40" />
              <p className="text-muted">Click "Search Jobs" to find opportunities</p>
              <p className="text-muted text-xs opacity-70">No API calls until you search!</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Briefcase size={40} className="text-muted opacity-40" />
              <p className="text-muted">No jobs found. Try different filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh]
              overflow-y-auto pr-1">
              {filteredJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSelect={setSelectedJob}
                  isSelected={selectedJob?.id === job.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Apply Panel */}
        <div className="flex flex-col gap-4">
          <div className="glass rounded-xl p-6 flex flex-col gap-5 sticky top-24">
            <h2 className="text-white font-bold text-lg">Apply with AI</h2>

            {/* Selected Job Preview */}
            {selectedJob ? (
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                <p className="text-accent text-xs font-medium mb-1">Selected Job</p>
                <p className="text-white font-semibold text-sm">{selectedJob.title}</p>
                <p className="text-muted text-xs">{selectedJob.company}</p>
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-xl p-4 text-center">
                <p className="text-muted text-sm">← Select a job to apply</p>
              </div>
            )}

            {/* Resume Upload */}
            <div>
              <p className="text-white text-sm font-medium mb-2">Your Resume</p>
              <FileUpload
                onFileSelect={setResume}
                file={resume}
                onClear={() => setResume(null)}
              />
            </div>

            {/* Progress */}
            {generating && <StepProgress currentStep={currentStep} />}

            {/* Error */}
            {error && generating === false && (
              <div className="bg-danger/10 border border-danger/30 text-danger
                rounded-xl px-4 py-3 text-xs">
                {error}
              </div>
            )}

            {/* Generate / View Results Button */}
            {generationComplete ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleViewResults}
                  className="gradient-btn text-white font-semibold py-3.5 rounded-xl
                  flex items-center justify-center gap-2 w-full"
                >
                  <ChevronRight size={16} />
                  View Results
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={handleRestart}
                  className="text-white font-semibold py-3 rounded-xl
                  flex items-center justify-center gap-2 w-full border border-border
                  hover:bg-white/5 transition-colors"
                >
                  Start Over
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!selectedJob || !resume || generating}
                className="gradient-btn text-white font-semibold py-3.5 rounded-xl
                flex items-center justify-center gap-2 w-full"
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Agents working...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Generate Package
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            )}

            {/* Info */}
            <div className="flex flex-col gap-2">
              {[
                { label: 'ATS-optimized resume', icon: FileText },
                { label: 'Personalized cover letter', icon: Mail },
                { label: 'Live company research', icon: Globe },
                { label: 'Interview prep + chatbot', icon: Brain },
              ].map(item => {
                const IconComponent = item.icon
                return (
                  <div key={item.label} className="flex items-center gap-2 text-muted text-xs">
                    <IconComponent size={14} className="text-accent shrink-0" />
                    {item.label}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}