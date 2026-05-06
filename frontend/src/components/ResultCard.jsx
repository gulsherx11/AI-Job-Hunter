import { useState } from 'react'
import { Copy, Check, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function ResultCard({ title, content, downloadName, isMarkdown }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = downloadName
    a.click()
    URL.revokeObjectURL(url)
  }

  const markdownComponents = {
    h1: ({ node, ...props }) => <h1 className="text-white font-bold text-lg mb-3 mt-4" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-white font-bold text-base mb-2 mt-3" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-white font-bold text-sm mb-2 mt-2" {...props} />,
    p: ({ node, ...props }) => <p className="text-muted text-sm mb-2 leading-relaxed" {...props} />,
    li: ({ node, ...props }) => <li className="text-muted text-sm mb-1 ml-4" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc mb-2" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal mb-2" {...props} />,
    strong: ({ node, ...props }) => <strong className="text-white font-semibold" {...props} />,
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-white">{title}</h3>
        <div className="flex gap-2">
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border
            text-xs text-muted hover:text-white hover:border-accent transition-all">
            {copied
              ? <><Check size={12} className="text-success" /> Copied!</>
              : <><Copy size={12} /> Copy</>
            }
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-btn
            text-xs text-white">
            <Download size={12} /> Download
          </button>
        </div>
      </div>
      <div className="p-5 max-h-[500px] overflow-y-auto">
        {!content ? (
          <p className="text-muted text-sm italic">No content available</p>
        ) : isMarkdown ? (
          <ReactMarkdown components={markdownComponents}>
            {content}
          </ReactMarkdown>
        ) : (
          <pre className="text-sm text-muted whitespace-pre-wrap font-sans leading-relaxed">
            {content}
          </pre>
        )}
      </div>
    </div>
  )
}