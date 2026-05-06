import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X } from 'lucide-react'

export default function FileUpload({ onFileSelect, file, onClear }) {
  const onDrop = useCallback(files => {
    if (files[0]) onFileSelect(files[0])
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  })

  if (file) {
    return (
      <div className="flex items-center justify-between bg-success/10 border 
        border-success/30 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-success" />
          <span className="text-sm text-white font-medium">{file.name}</span>
          <span className="text-xs text-muted">
            ({(file.size / 1024).toFixed(0)} KB)
          </span>
        </div>
        <button onClick={onClear} className="text-muted hover:text-danger transition-colors">
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200
        ${isDragActive
          ? 'border-accent bg-accent/10'
          : 'border-border hover:border-accent/50 hover:bg-card'
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center
          ${isDragActive ? 'bg-accent' : 'bg-card border border-border'}`}>
          <Upload size={20} className={isDragActive ? 'text-white' : 'text-muted'} />
        </div>
        <div>
          <p className="text-white font-medium">Drop your resume here</p>
          <p className="text-muted text-sm mt-1">or click to browse • PDF only</p>
        </div>
      </div>
    </div>
  )
}