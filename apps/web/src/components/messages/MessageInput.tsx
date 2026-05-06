'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { sendMessage } from '@/app/actions/messages'

interface MessageInputProps {
  recipientId: string
}

export default function MessageInput({ recipientId }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await sendMessage(recipientId, content)
      if (result.error) {
        setError(result.error)
      } else {
        setContent('')
        textareaRef.current?.focus()
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-white p-4">
      {error && (
        <p className="text-xs text-red-500 mb-2">{error}</p>
      )}
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message… (Enter to send, Shift+Enter for new line)"
          maxLength={2000}
          rows={1}
          className="flex-1 px-4 py-3 border border-border rounded-2xl text-sm leading-relaxed focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none text-text"
          aria-label="Message content"
          disabled={isPending}
          style={{ maxHeight: '120px', overflowY: 'auto' }}
        />
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="w-11 h-11 rounded-2xl bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          aria-label="Send message"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} aria-hidden="true" />}
        </button>
      </div>
    </form>
  )
}
