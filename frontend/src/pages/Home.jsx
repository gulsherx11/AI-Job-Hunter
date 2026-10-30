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

const JOBS_STORAGE_KEY = 'jobify_jobs'
const GENERATION_STORAGE_KEY = 'jobify_generation_state'

export default function Home() {
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [resume, setResume] = useState(null)
  const [country, setCountry] = useState('Pakistan')
  const [city, setCity] = useState('Karachi')
  const [selectedDomain, setSelectedDomain] = useState('AI Engineer')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [allDomains, setAllDomains] = useState(false)
  const [jobType, setJobType] = useState('all')
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [generationComplete, setGenerationComplete] = useState(false)
  const [generationData, setGenerationData] = useState(null)

  const domainSuggestions = [
    'AI Engineer',
    'Machine Learning Engineer',
    'Data Scientist',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Software Engineer',
    'Data Engineer',
    'Cloud Engineer',
    'DevOps Engineer',
    'Product Manager'
  ]

  const countrySuggestions = [
    'Pakistan',
    'United States',
    'United Kingdom',
    'Canada',
    'Germany',
    'United Arab Emirates',
    'Singapore',
    'Australia'
  ]

  const citySuggestions = [
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Remote',
    'New York',
    'London',
    'Dubai',
    'Singapore',
    'Berlin'
  ]

  const buildFlexibleQuery = (domain) => {
    const q = domain.trim()
    if (!q) return undefined

    const aliases = {
      'ai engineer': 'AI Engineer OR Machine Learning Engineer OR Generative AI Engineer OR AI Research Engineer',
      'machine learning engineer': 'Machine Learning Engineer OR ML Engineer OR AI Engineer OR Applied Scientist',
      'data scientist': 'Data Scientist OR Senior Data Scientist OR Applied Scientist OR Analytics Engineer',
      'full stack developer': 'Full Stack Developer OR Fullstack Developer OR Web Developer OR Software Engineer',
      'frontend developer': 'Frontend Developer OR Frontend Engineer OR React Developer OR UI Engineer',
      'backend developer': 'Backend Developer OR Backend Engineer OR Python Developer OR Java Developer',
      'software engineer': 'Software Engineer OR Application Engineer OR Platform Engineer OR Product Engineer',
      'data engineer': 'Data Engineer OR Analytics Engineer OR ETL Engineer OR Big Data Engineer',
      'cloud engineer': 'Cloud Engineer OR DevOps Engineer OR AWS Engineer OR Azure Engineer',
      'devops engineer': 'DevOps Engineer OR Cloud Engineer OR Site Reliability Engineer',
      'product manager': 'Product Manager OR Technical Product Manager OR Product Owner'
    }

    const key = q.toLowerCase()
    return aliases[key] || q
  }

  const filteredSuggestions = allDomains
    ? ['All domains', ...domainSuggestions]
    : domainSuggestions.filter(item => item.toLowerCase().includes(selectedDomain.toLowerCase()))

  const handleSearch = async () => {
    setHasSearched(true)
    await loadJobs()
  }

  const handleViewResults = () => {
    navigate('/results', { state: generationData })
  }

  const persistJobs = (jobList) => {
    sessionStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobList))
  }

  const persistGenerationState = () => {
    sessionStorage.setItem(GENERATION_STORAGE_KEY, JSON.stringify({
      generating,
      currentStep,
      generationComplete,
      generationData,
      selectedJob,
      resume: resume ? { name: resume.name, size: resume.size, type: resume.type } : null,
    }))
  }

  const clearPersistedJobs = () => {
    sessionStorage.removeItem(JOBS_STORAGE_KEY)
  }

  const clearGenerationState = () => {
    sessionStorage.removeItem(GENERATION_STORAGE_KEY)
  }

  const handleRestart = () => {
    clearPersistedJobs()
    clearGenerationState()
    setJobs([])
    setFilteredJobs([])
    setHasSearched(false)
    setGenerating(false)
    setGenerationComplete(false)
    setGenerationData(null)
    setCurrentStep(0)
    setSelectedJob(null)
    setResume(null)
  }

  useEffect(() => {
    const savedJobs = sessionStorage.getItem(JOBS_STORAGE_KEY)
    if (!savedJobs) return

    try {
      const parsed = JSON.parse(savedJobs)
      if (Array.isArray(parsed) && parsed.length > 0) {
        setJobs(parsed)
        setFilteredJobs(parsed)
        setHasSearched(true)
      }
    } catch (error) {
      console.error('Failed to restore jobs from session storage', error)
    }

    const savedGeneration = sessionStorage.getItem(GENERATION_STORAGE_KEY)
    if (!savedGeneration) return

    try {
      const parsedGeneration = JSON.parse(savedGeneration)
      if (parsedGeneration) {
        setGenerating(Boolean(parsedGeneration.generating))
        setCurrentStep(parsedGeneration.currentStep || 0)
        setGenerationComplete(Boolean(parsedGeneration.generationComplete))
        setGenerationData(parsedGeneration.generationData || null)
        setSelectedJob(parsedGeneration.selectedJob || null)
        if (parsedGeneration.resume && typeof parsedGeneration.resume === 'object') {
          setResume({
            name: parsedGeneration.resume.name,
            size: parsedGeneration.resume.size,
            type: parsedGeneration.resume.type,
          })
        }
      }
    } catch (error) {
      console.error('Failed to restore generation state from session storage', error)
    }
  }, [])

  useEffect(() => {
    persistGenerationState()
  }, [generating, currentStep, generationComplete, generationData, selectedJob, resume])

  const matchesJobType = (job) => {
    if (jobType === 'all') return true

    const typeText = (job.type || '').toLowerCase()
    const descText = (job.description || '').toLowerCase()
    const locText = (job.location || '').toLowerCase()
    const isRemote = Boolean(job.is_remote) || typeText.includes('remote') || locText.includes('remote')
    const isHybrid = typeText.includes('hybrid') || descText.includes('hybrid') || locText.includes('hybrid')

    if (jobType === 'remote') return isRemote
    if (jobType === 'hybrid') return isHybrid || (!isRemote && (typeText.includes('hybrid') || descText.includes('hybrid')))
    if (jobType === 'onsite') return !isRemote && !isHybrid && !typeText.includes('remote') && !typeText.includes('hybrid')

    return true
  }

  const sortJobsByRecent = (jobList) => {
    return [...jobList].sort((a, b) => {
      const aTime = a.posted_at ? new Date(a.posted_at).getTime() : 0
      const bTime = b.posted_at ? new Date(b.posted_at).getTime() : 0
      return bTime - aTime
    })
  }

  useEffect(() => {
    const domainTerm = selectedDomain.trim().toLowerCase()
    let nextJobs = jobs.filter(job => matchesJobType(job))

    if (allDomains || !domainTerm) {
      setFilteredJobs(sortJobsByRecent(nextJobs))
      return
    }

    const keywords = [
      selectedDomain.toLowerCase(),
      ...selectedDomain.toLowerCase().split(/\s+/).filter(Boolean)
    ]

    const matched = nextJobs.filter(job => {
      const haystack = [
        job.title || '',
        job.company || '',
        job.description || ''
      ].join(' ').toLowerCase()

      return keywords.some(keyword => haystack.includes(keyword))
    })

    setFilteredJobs(sortJobsByRecent(matched))
  }, [selectedDomain, jobs, allDomains, jobType])

  const loadJobs = async () => {
    setLoadingJobs(true)
    setError(null)
    try {
      const locationQuery = city && city !== 'Remote' ? `${city}, ${country}` : country

      const res = await axios.get(`${apiUrl}/api/jobs`, {
        params: {
          location: locationQuery,
          remote: jobType === 'remote',
          query: allDomains ? undefined : buildFlexibleQuery(selectedDomain)
        }
      })
      const sortedJobs = sortJobsByRecent(res.data.jobs || [])
      setJobs(sortedJobs)
      setFilteredJobs(sortedJobs)
      persistJobs(sortedJobs)
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
      setGenerating(false)

    } catch (err) {
      clearInterval(interval)
      setError('Generation failed. Please try again.')
    }

    setGenerating(false)
  }

  return (
    <div className="indeed-page px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <p className="text-accent text-sm font-semibold mb-2">
          Search smarter with Jobify
        </p>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          Find your next role
        </h1>
        <p className="text-muted text-base max-w-xl mx-auto leading-relaxed">
          Search current openings and prepare a stronger application in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Job List */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Filters */}
          <div className="glass rounded-xl p-2 shadow-sm flex flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-64 bg-card
              border border-border rounded-lg px-3 py-2 relative">
              <Briefcase size={15} className="text-muted shrink-0" />
              <input
                value={selectedDomain}
                onChange={e => {
                  setSelectedDomain(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                placeholder="Search job domain..."
                className="bg-transparent text-white text-sm placeholder:text-muted
                focus:outline-none w-full"
              />

              {showSuggestions && !allDomains && (
                <div className="absolute left-0 top-full mt-2 w-full bg-[#101822] border border-border rounded-xl shadow-2xl z-20 overflow-hidden">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map(item => (
                      <button
                        key={item}
                        type="button"
                        onMouseDown={() => {
                          setSelectedDomain(item)
                          setShowSuggestions(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-white/5 transition-colors"
                      >
                        {item}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted">No matching domains</div>
                  )}
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer px-3 py-2
              bg-card border border-border rounded-lg">
              <input
                type="checkbox"
                checked={allDomains}
                onChange={e => {
                  const checked = e.target.checked
                  setAllDomains(checked)
                  if (checked) {
                    setSelectedDomain('')
                    setShowSuggestions(false)
                  } else {
                    setSelectedDomain('AI Engineer')
                  }
                }}
                className="accent-accent"
              />
              <span className="text-sm text-muted">All domains</span>
            </label>
            <div className="flex items-center gap-2 bg-card border border-border
              rounded-lg px-3 py-2 min-w-[150px]">
              <MapPin size={15} className="text-muted" />
              <input
                list="country-options"
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="Country"
                className="bg-transparent text-white text-sm placeholder:text-muted
                focus:outline-none w-full"
              />
              <datalist id="country-options">
                {countrySuggestions.map(option => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
            <div className="flex items-center gap-2 bg-card border border-border
              rounded-lg px-3 py-2 min-w-[150px]">
              <MapPin size={15} className="text-muted" />
              <input
                list="city-options"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="City"
                className="bg-transparent text-white text-sm placeholder:text-muted
                focus:outline-none w-full"
              />
              <datalist id="city-options">
                {citySuggestions.map(option => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
            <label className="flex items-center gap-2 bg-card border border-border
              rounded-lg px-3 py-2 min-w-[150px]">
              <Wifi size={14} className="text-muted" />
              <select
                value={jobType}
                onChange={e => setJobType(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none w-full appearance-none"
              >
                <option value="all" className="bg-slate-900">All jobs</option>
                <option value="remote" className="bg-slate-900">Remote</option>
                <option value="hybrid" className="bg-slate-900">Hybrid</option>
                <option value="onsite" className="bg-slate-900">Onsite</option>
              </select>
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
            <h2 className="text-white font-bold text-lg">Build your application</h2>

            {/* Selected Job Preview */}
            {selectedJob ? (
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-accent text-xs font-medium mb-1">Selected Job</p>
                  <p className="text-white font-semibold text-sm">{selectedJob.title}</p>
                  <p className="text-muted text-xs">{selectedJob.company}</p>
                </div>

                {selectedJob.apply_link && (
                  <a
                    href={selectedJob.apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white/5 text-white px-3 py-2 text-sm hover:bg-white/10 transition-colors"
                  >
                    Apply on job site
                  </a>
                )}
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
                    Preparing package...
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