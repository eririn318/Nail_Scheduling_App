'use client'

import { ChevronLeft } from 'lucide-react'
import type { Service } from '@/lib/booking-data'

type Props = {
  services: Service[]
  time: string | null
  total: number
  venmoHandle: string
  zelleContact: string
  onBack: () => void
  onPaid: () => void
  date: string
}

export function PaymentStep({
  services,
  time,
  total,
  venmoHandle,
  zelleContact,
  onBack,
  onPaid,
  date
}: Props) {
  const venmoUrl = `https://venmo.com/${venmoHandle.replace('@', '')}?txn=pay&amount=${total}&note=Nail%20appointment`

  return (
    <div className="flex flex-col gap-7">
      <header className="pt-2">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back
        </button>
        <p className="font-serif text-sm italic tracking-wide text-gold">
          Almost yours
        </p>
        <h1 className="mt-1 text-pretty font-serif text-3xl font-semibold leading-tight text-foreground">
          Complete your booking
        </h1>
      </header>

      <div className="rounded-3xl border border-border bg-card/60 p-5">
        <ul className="flex flex-col gap-3">
          {services.map((service) => (
            <li key={service.id} className="flex items-baseline justify-between gap-3">
              <span className="text-sm leading-snug text-foreground">
                {service.name}
              </span>
              <span className="shrink-0 text-sm text-muted-foreground">
                {`$${service.price}`}
              </span>
            </li>
          ))}
        </ul>
        {time && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Appointment</span>
            <span className="font-serif text-base text-foreground">
              {`${date} · ${time}`}
            </span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Total due</span>
          <span className="font-serif text-3xl font-semibold text-gold">
            {`$${total}`}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <a
          href={venmoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onPaid}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-venmo py-4 text-base font-semibold text-venmo-foreground shadow-[0_12px_30px_-12px_rgba(152,112,112,0.6)] transition-transform active:scale-[0.99]"
        >
          Pay with Venmo
        </a>
        <p className="text-center text-xs text-muted-foreground">
          {`You'll be paying `}
          <span className="font-medium text-foreground">{venmoHandle}</span>
        </p>
      </div>

      <div className="rounded-3xl border border-dashed border-gold/40 bg-secondary/40 p-5">
        <h2 className="font-serif text-lg text-foreground">Prefer Zelle?</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Send the total to{' '}
          <span className="font-medium text-foreground">{zelleContact}</span> and
          include your name in the memo. Once sent, tap below so I know to expect it.
        </p>
        <button
          type="button"
          onClick={onPaid}
          className="mt-4 w-full rounded-full border border-gold/50 bg-transparent py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          I&apos;ve sent it via Zelle
        </button>
      </div>
    </div>
  )
}
