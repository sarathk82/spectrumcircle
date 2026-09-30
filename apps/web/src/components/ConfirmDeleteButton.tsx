'use client'

import { Trash2 } from 'lucide-react'

interface ConfirmDeleteButtonProps {
  action: (formData: FormData) => void | Promise<void>
  id: string
  label?: string
}

export default function ConfirmDeleteButton({ action, id, label = 'Delete' }: ConfirmDeleteButtonProps) {
  return (
    <form
      action={action}
      className="flex items-center"
      onSubmit={(event) => {
        if (!window.confirm('Delete this record permanently? This action cannot be undone.')) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        aria-label={label}
        title={label}
      >
        <Trash2 size={15} aria-hidden="true" />
      </button>
    </form>
  )
}
