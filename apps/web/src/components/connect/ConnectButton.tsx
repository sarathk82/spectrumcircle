'use client'

import { useState, useTransition } from 'react'
import { UserPlus, UserCheck, UserX, Clock, Loader2 } from 'lucide-react'
import {
  sendConnectionRequest,
  acceptConnection,
  declineConnection,
  withdrawConnection,
} from '@/app/actions/connections'

type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted'

interface ConnectButtonProps {
  targetUserId: string
  initialStatus: ConnectionStatus
  connectionId?: string
  /** compact mode for list cards */
  size?: 'sm' | 'default'
}

export default function ConnectButton({
  targetUserId,
  initialStatus,
  connectionId,
  size = 'default',
}: ConnectButtonProps) {
  const [status, setStatus] = useState<ConnectionStatus>(initialStatus)
  const [connId, setConnId] = useState(connectionId)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const sm = size === 'sm'

  const handleSend = () => {
    setError(null)
    startTransition(async () => {
      const result = await sendConnectionRequest(targetUserId)
      if (result.error) {
        setError(result.error)
      } else {
        setStatus('pending_sent')
      }
    })
  }

  const handleAccept = () => {
    if (!connId) return
    setError(null)
    startTransition(async () => {
      const result = await acceptConnection(connId)
      if (result.error) setError(result.error)
      else setStatus('accepted')
    })
  }

  const handleDecline = () => {
    if (!connId) return
    setError(null)
    startTransition(async () => {
      const result = await declineConnection(connId)
      if (result.error) setError(result.error)
      else setStatus('none')
    })
  }

  const handleWithdraw = () => {
    if (!connId) return
    setError(null)
    startTransition(async () => {
      const result = await withdrawConnection(connId)
      if (result.error) setError(result.error)
      else { setStatus('none'); setConnId(undefined) }
    })
  }

  const base = sm
    ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all'
    : 'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all'

  return (
    <div className="flex flex-col gap-1">
      {status === 'none' && (
        <button
          onClick={handleSend}
          disabled={isPending}
          className={`${base} bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-60`}
        >
          {isPending ? <Loader2 size={sm ? 13 : 15} className="animate-spin" /> : <UserPlus size={sm ? 13 : 15} />}
          Connect
        </button>
      )}

      {status === 'pending_sent' && (
        <button
          onClick={handleWithdraw}
          disabled={isPending}
          className={`${base} bg-gray-100 text-text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-60`}
        >
          {isPending ? <Loader2 size={sm ? 13 : 15} className="animate-spin" /> : <Clock size={sm ? 13 : 15} />}
          Pending
        </button>
      )}

      {status === 'pending_received' && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleAccept}
            disabled={isPending}
            className={`${base} bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-60`}
          >
            {isPending ? <Loader2 size={sm ? 13 : 15} className="animate-spin" /> : <UserCheck size={sm ? 13 : 15} />}
            Accept
          </button>
          <button
            onClick={handleDecline}
            disabled={isPending}
            className={`${base} bg-gray-100 text-text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-60`}
          >
            <UserX size={sm ? 13 : 15} />
            Decline
          </button>
        </div>
      )}

      {status === 'accepted' && (
        <span className={`${base} bg-green-50 text-green-700 cursor-default`}>
          <UserCheck size={sm ? 13 : 15} />
          Connected
        </span>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  )
}
