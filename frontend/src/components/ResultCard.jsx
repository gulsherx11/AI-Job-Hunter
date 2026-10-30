import { useState } from 'react'
import { Copy, Check, Download, FileText, FileCode, Loader2, Eye, Code } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import ResumePreview from './ResumePreview'
import { downloadResumeAsDocx, downloadResumeAsPdf } from '../utils/resumeExport'

export default function ResultCard({
  title,
  content,
  downloadName,
  isMarkdown = false,
  isResume = false,
}) {
  const [copied, setCopied] = useState(false)
  const [downloadingDocx, setDownloadingDocx] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [viewMode, setViewMode] = useState(isResume ? 'preview' : 'text')

  const containerId = `export-doc-${title.replace(/\s+/g, '-').toLowerCase()}`

  const handleCopy = () => {
    navigator.clipboard.writeText(content || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadTxt = () => {
    const filename = downloadName.endsWith('.txt') ? downloadName : `${downloadName}.txt`
    const blob = new Blob([content || ''], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadDocx = async () => {
    try {
      setDownloadingDocx(true)
      const baseName = downloadName.replace(/\.[^/.]+$/, '')
      await downloadResumeAsDocx(content, `${baseName}.docx`)
    } catch (err) {
      console.error('Failed to export DOCX:', err)
      alert('Could not export Word document. Please try again.')
    } finally {
      setDownloadingDocx(false)
    }
  }

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true)
      // Ensure preview mode is active for proper DOM rendering
      if (viewMode !== 'preview') {
        setViewMode('preview')
        await new Promise((r) => setTimeout(r, 150))
      }
      const baseName = downloadName.replace(/\.[^/.]+$/, '')
      await downloadResumeAsPdf(containerId, `${baseName}.pdf`)
    } catch (err) {
      console.error('Failed to export PDF:', err)
      alert('Could not export PDF. Please try again.')
    } finally {
      setDownloadingPdf(false)
    }
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
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-white">{title}</h3>
          {isResume && (
            <div className="flex items-center bg-background border border-border rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-accent text-white font-medium'
                    : 'text-muted hover:text-white'
                }`}
              >
                <Eye size={12} /> ATS Preview
              </button>
              <button
                type="button"
                onClick={() => setViewMode('text')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'text'
                    ? 'bg-accent text-white font-medium'
                    : 'text-muted hover:text-white'
                }`}
              >
                <Code size={12} /> Plain Text
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border
            text-xs text-muted hover:text-white hover:border-accent transition-all"
            title="Copy text to clipboard"
          >
            {copied ? (
              <>
                <Check size={12} className="text-success" /> Copied!
              </>
            ) : (
              <>
                <Copy size={12} /> Copy
              </>
            )}
          </button>

          {isResume ? (
            <>
              {/* PDF Download Button */}
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/30
                text-xs font-medium transition-all disabled:opacity-50"
                title="Download ATS formatted PDF"
              >
                {downloadingPdf ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <FileText size={12} className="text-red-400" />
                )}
                Download PDF
              </button>

              {/* Word (.docx) Download Button */}
              <button
                onClick={handleDownloadDocx}
                disabled={downloadingDocx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30
                text-xs font-medium transition-all disabled:opacity-50"
                title="Download ATS formatted Microsoft Word document (.docx)"
              >
                {downloadingDocx ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <FileCode size={12} className="text-blue-400" />
                )}
                Download Word (.docx)
              </button>

              {/* TXT Download Button */}
              <button
                onClick={handleDownloadTxt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border
                text-xs text-muted hover:text-white transition-all"
                title="Download raw plain text file"
              >
                <Download size={12} /> TXT
              </button>
            </>
          ) : (
            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-btn
              text-xs text-white"
            >
              <Download size={12} /> Download
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 max-h-[650px] overflow-y-auto">
        {!content ? (
          <p className="text-muted text-sm italic">No content available</p>
        ) : isResume && viewMode === 'preview' ? (
          <ResumePreview content={content} containerId={containerId} />
        ) : isMarkdown ? (
          <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
        ) : (
          <pre className="text-sm text-muted whitespace-pre-wrap font-sans leading-relaxed">
            {content}
          </pre>
        )}
      </div>
    </div>
  )
}
