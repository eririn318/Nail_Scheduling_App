'use client'

import { Check } from 'lucide-react'
import type { Service } from '@/lib/booking-data'

type Props = {
  clientName: string
  artistName: string
  services: Service[]
  selected: string[]
  onToggle: (serviceId: string) => void
  onContinue: () => void
  totalDurationMinutes: number
  durationMinutes: number
}

export function WelcomeStep({
  clientName,
  artistName,
  services = [],
  selected = [],
  onToggle,
  onContinue,
  totalDurationMinutes,
  durationMinutes
}: Props) {
  const total = (services || [])
    .filter((s) => selected.includes(s.serviceId || s._id || s.id || ''))
    .reduce((sum, s) => sum + (s.price || 0), 0)

  return (
    <div className="flex flex-col gap-7">
      <header className="pt-2 text-center">
        <p className="font-serif text-sm italic tracking-wide text-gold">
          {`A private invitation from ${artistName}`}
        </p>
        <h1 className="mt-2 text-pretty font-serif text-4xl font-semibold leading-tight text-foreground">
          {`Hi ${clientName} `}
          <span aria-hidden="true">✨</span>
        </h1>
        <p className="mx-auto mt-3 max-w-[15rem] text-pretty text-sm leading-relaxed text-muted-foreground">
          I&apos;ve set aside these services just for you. Tap to confirm what
          you&apos;d like.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {(services || []).map((service) => {
          const serviceId = service._id || service.id || service.serviceId || ''
          const isSelected = selected.includes(service.serviceId)
          return (
            <li key={service.serviceId}>
              <button
                type="button"
                onClick={() => onToggle(service.serviceId)}
                aria-pressed={isSelected}
                className={`w-full rounded-3xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-primary/50 bg-card shadow-[0_10px_30px_-16px_rgba(120,30,30,0.5)]'
                    : 'border-border bg-card/50 hover:bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="size-3.5" aria-hidden="true" />}
                    </span>
                    <span>
                      <span className="block font-serif text-lg leading-snug text-foreground">
                        {service.name}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {service.description}
                      </span>
                      <span className="mt-1 block text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                        {service.duration}
                      </span>
                      <span className="mt-1 block text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                        <p>Service time: {service.durationMinutes} mins</p>
                      </span>
                    </span>
                  </div>
                  <span className="shrink-0 font-serif text-lg font-semibold text-gold">
                    {`$${service.price}`}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-serif text-2xl font-semibold text-gold">
            {`$${total}`}
          </span>
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-muted-foreground">Total service time</span>
          <span className="font-serif text-2xl font-semibold text-gold">
            {`${totalDurationMinutes} mins`}
          </span>
        </div>
        
        <button
          type="button"
          onClick={onContinue}
          disabled={selected.length === 0}
          className="w-full rounded-full bg-primary py-4 font-medium tracking-wide text-primary-foreground shadow-[0_12px_30px_-14px_rgba(120,30,30,0.7)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Choose a time
        </button>
      </div>
    </div>
  )
}
