import { useRef, useState } from 'react'
import { MessageCircle, X, Send, ShieldCheck } from 'lucide-react'
import { api } from '../lib/api'
import type { ChatMessage } from '../types/finance'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [shareFinanceData, setShareFinanceData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage: ChatMessage = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.sendChatMessage(
        text,
        shareFinanceData,
        messages.slice(-20)
      )
      setMessages([...updatedMessages, { role: 'assistant', content: response.reply }])
    } catch {
      setError('Failed to get a response. Check that an AI API key is configured.')
    } finally {
      setIsLoading(false)
      setTimeout(scrollToBottom, 50)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 glass-card-dark rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden" style={{ height: '480px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-400" />
              <span className="font-bold text-white text-sm uppercase tracking-wider">Finance Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Permission toggle */}
          <label className="flex items-center gap-2 px-4 py-2 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
            <input
              type="checkbox"
              checked={shareFinanceData}
              onChange={(e) => setShareFinanceData(e.target.checked)}
              className="w-4 h-4 accent-purple-500"
            />
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-white/70 font-medium">
              Let assistant see my finance data
            </span>
          </label>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-white/40 text-sm text-center mt-8">
                Ask me anything about your finances.
                {shareFinanceData ? ' I can see your data.' : ' Enable data sharing above for personalized answers.'}
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm'
                      : 'bg-white/10 text-white/90 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 px-3 py-2 rounded-2xl rounded-bl-sm text-sm text-white/50">
                  Thinking...
                </div>
              </div>
            )}
            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 glass text-white text-sm focus:outline-none rounded-xl disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:scale-105 disabled:opacity-50 transition-all"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg glow-purple hover:scale-110 transition-all flex items-center justify-center"
        aria-label="Open finance assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  )
}
