import { FileText, Edit2, Globe, Mail, Brain, Check } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Parsing JD' },
  { id: 2, label: 'Rewriting Resume' },
  { id: 3, label: 'Researching' },
  { id: 4, label: 'Cover Letter' },
  { id: 5, label: 'Interview Prep' },
]

const STEP_ICONS = {
  1: FileText,
  2: Edit2,
  3: Globe,
  4: Mail,
  5: Brain,
}

export default function StepProgress({ currentStep }) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-border z-0" />
        <div
          className="absolute left-0 top-4 h-0.5 bg-accent z-0 transition-all duration-700"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map(step => {
          const IconComponent = STEP_ICONS[step.id]
          return (
            <div key={step.id} className="flex flex-col items-center z-10 gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                text-sm transition-all duration-300 border-2
                ${currentStep > step.id
                  ? 'bg-success border-success text-white'
                  : currentStep === step.id
                    ? 'bg-accent border-accent text-white animate-pulse'
                    : 'bg-background border-border text-muted'
                }`}>
                {currentStep > step.id ? (
                  <Check size={16} />
                ) : (
                  <IconComponent size={16} />
                )}
              </div>
              <span className={`text-xs text-center w-16 leading-tight
                ${currentStep >= step.id ? 'text-white' : 'text-muted'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}