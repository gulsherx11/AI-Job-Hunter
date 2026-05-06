import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Send, Bot, User, RotateCcw, AlertCircle, Play } from 'lucide-react'

export default function ChatBot({ state }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    console.log('ChatBot mounted with state:', state)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, state])

  const startInterview = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('http://localhost:8000/api/chat', {
        message: '',
        history: [],
        state
      })
      setMessages([{ role: 'assistant', content: res.data.response }])
      setStarted(true)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to start interview. Please try again.')
    }
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await axios.post('http://localhost:8000/api/chat', {
        message: input,
        history: messages,
        state
      })
      setMessages([...newHistory,
        { role: 'assistant', content: res.data.response }
      ])
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to send message. Please try again.')
      setMessages(newHistory)
    }
    setLoading(false)
  }

  const reset = () => {
    setMessages([])
    setStarted(false)
    setInput('')
    setError(null)
  }

  if (!state) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-red-400">Error: No job data available for interview</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center">
            <Bot size={15} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">AI Interviewer</p>
            <p className="text-muted text-xs">
              {state.company_name} • {state.role_title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {started && (
            <button onClick={reset}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-white
              transition-colors border border-border px-2.5 py-1.5 rounded-lg">
              <RotateCcw size={12} /> Restart
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${started ? 'bg-success animate-pulse' : 'bg-muted'}`} />
            <span className={`text-xs ${started ? 'text-success' : 'text-muted'}`}>
              {started ? 'Live' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-5 flex flex-col gap-4">
        {error && (
          <div className="flex gap-3 mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {!started ? (
          <div className="flex flex-col items-center justify-center h-full gap-5">
            <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center">
              <Bot size={28} className="text-white" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold mb-1">Ready for your mock interview?</p>
              <p className="text-muted text-sm max-w-xs">
                The AI knows your resume and will ask tailored questions for{' '}
                {state.company_name}
              </p>
            </div>
            <button
              onClick={startInterview}
              disabled={loading}
              className="gradient-btn text-white px-6 py-3 rounded-xl font-semibold
              text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white
                    rounded-full animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Play size={14} />
                  Start Mock Interview
                </>
              )}
            </button>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
                ${msg.role === 'assistant' ? 'gradient-btn' : 'bg-border'}`}>
                {msg.role === 'assistant'
                  ? <Bot size={13} className="text-white" />
                  : <User size={13} className="text-white" />
                }
              </div>
              <div className={`max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'assistant'
                  ? 'bg-background text-white rounded-tl-none border border-border'
                  : 'gradient-btn text-white rounded-tr-none'
                }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}

        {loading && started && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full gradient-btn flex items-center justify-center">
              <Bot size={13} className="text-white" />
            </div>
            <div className="bg-background border border-border px-4 py-3 rounded-2xl rounded-tl-none">
              <div className="flex gap-1 items-center h-4">
                {[0, 150, 300].map(delay => (
                  <div key={delay}
                    className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {started && (
        <div className="border-t border-border p-4 flex gap-3 bg-background/30">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type your answer..."
            className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5
            text-white text-sm placeholder:text-muted focus:outline-none
            focus:border-accent transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-10 h-10 gradient-btn rounded-xl flex items-center
            justify-center disabled:opacity-40 shrink-0"
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
      )}
    </div>
  )
}