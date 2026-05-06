import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ResultCard from '../components/ResultCard'
import ChatBot from '../components/ChatBot'
import { ArrowLeft, ExternalLink, FileText, Mail, Building2, MessageCircle } from 'lucide-react'

const TABS = [
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'cover', label: 'Cover Letter', icon: Mail },
  { id: 'research', label: 'Company', icon: Building2 },
  { id: 'interview', label: 'Interview', icon: MessageCircle },
]

export default function Results() {
  const { state: result } = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('resume')

  if (!result) {
    navigate('/')
    return null
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted hover:text-white
          transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Jobs
        </button>
        {result.apply_link && (
          <a
            href={result.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-btn text-white text-sm px-4 py-2 rounded-lg
            flex items-center gap-2"
          >
            Apply Now <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Company', value: result.company_name },
          { label: 'Role', value: result.role_title },
          { label: 'Skills Matched', value: `${result.required_skills?.length} skills` },
        ].map(m => (
          <div key={m.label}
            className="bg-card border border-border rounded-xl p-5 text-center">
            <p className="text-muted text-xs mb-1">{m.label}</p>
            <p className="text-white font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Skills Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {result.required_skills?.map(skill => (
          <span key={skill}
            className="text-xs bg-accent/10 text-accent border border-accent/20
            px-3 py-1 rounded-full">
            {skill}
          </span>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-card border border-border
        rounded-xl p-1 w-fit">
        {TABS.map(tab => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                ${activeTab === tab.id
                  ? 'gradient-btn text-white'
                  : 'text-muted hover:text-white'
                }`}
            >
              <IconComponent size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'resume' && (
        <ResultCard
          title="ATS-Optimized Resume"
          content={result.rewritten_resume}
          downloadName={`resume_${result.company_name}.txt`}
        />
      )}
      {activeTab === 'cover' && (
        <ResultCard
          title="Personalized Cover Letter"
          content={result.cover_letter}
          downloadName={`cover_letter_${result.company_name}.txt`}
        />
      )}
      {activeTab === 'research' && (
        <ResultCard
          title={`About ${result.company_name}`}
          content={result.company_research}
          downloadName={`research_${result.company_name}.txt`}
        />
      )}
      {activeTab === 'interview' && (
        <div className="flex flex-col gap-6">
          <ResultCard
            title="Interview Study Guide"
            content={result.interview_questions}
            downloadName="interview_prep.txt"
            isMarkdown={true}
          />
          {result ? (
            <ChatBot state={result} />
          ) : (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted">Loading interview component...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}