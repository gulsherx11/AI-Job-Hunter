import ReactMarkdown from 'react-markdown'

export default function ResumePreview({ content, containerId = 'resume-export-container' }) {
  if (!content) {
    return <p className="text-muted text-sm italic">No resume content available</p>
  }

  // Strip accidental ```markdown or ``` fences
  const cleanedContent = content
    .replace(/^```[a-z]*\n/i, '')
    .replace(/\n```$/, '')
    .trim()

  const resumeMarkdownComponents = {
    h1: ({ node, ...props }) => (
      <h1
        className="text-2xl font-bold text-slate-900 text-center tracking-tight pb-1 mb-1"
        style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h2
        className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b-2 border-slate-300 pb-1 mt-4 mb-2"
        style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3
        className="text-sm font-semibold text-slate-900 mt-2.5 mb-0.5"
        style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
        {...props}
      />
    ),
    p: ({ node, ...props }) => {
      // Check if this paragraph is the contact line (often contains |)
      const text = String(props.children)
      const isContactLine = text.includes('|') && text.length < 150
      return (
        <p
          className={`leading-relaxed mb-1.5 ${
            isContactLine
              ? 'text-center text-[11px] text-slate-600 mb-3'
              : 'text-xs text-slate-700'
          }`}
          style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
          {...props}
        />
      )
    },
    ul: ({ node, ...props }) => (
      <ul className="list-disc pl-5 space-y-1 mb-2 text-xs text-slate-700" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal pl-5 space-y-1 mb-2 text-xs text-slate-700" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="leading-relaxed" {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-semibold text-slate-900" {...props} />
    ),
    em: ({ node, ...props }) => (
      <em className="text-slate-500 text-[11px] not-italic block mb-1" {...props} />
    ),
  }

  return (
    <div className="w-full flex justify-center py-2">
      {/* Paper container styled for authentic A4 ATS look */}
      <div
        id={containerId}
        className="bg-white text-slate-900 rounded-lg p-8 sm:p-10 shadow-lg border border-slate-200 w-full max-w-[820px] transition-all"
        style={{
          fontFamily: 'Calibri, Arial, sans-serif',
          minHeight: '842px', // Standard proportional A4 height
        }}
      >
        <ReactMarkdown components={resumeMarkdownComponents}>
          {cleanedContent}
        </ReactMarkdown>
      </div>
    </div>
  )
}

