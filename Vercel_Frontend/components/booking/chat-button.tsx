'use client'

import { MessageCircle } from 'lucide-react'

export function ChatButton({ artistName }: { artistName: string }) {
  return (
    <div className="pointer-events-none sticky bottom-0 flex justify-center pb-6 pt-2">
      <button
        type="button"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/80 px-5 py-3 text-sm font-medium text-foreground shadow-[0_8px_24px_-12px_rgba(80,40,20,0.35)] backdrop-blur-md transition-colors hover:bg-card"
      >
        <MessageCircle className="size-4 text-primary" aria-hidden="true" />
        {`Chat with ${artistName}`}
      </button>
    </div>
  )
}
