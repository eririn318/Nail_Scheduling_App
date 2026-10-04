'use client'

import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'

type Props = {
  clientName: string
  artistName: string
  time: string | null
  total: number
  date: string
}

export function ConfirmationStep({ clientName, artistName, time, total, date }: Props) {
  const[year, month, day] = date.split('-')
  const formattedDate = `${month}-${day}-${year}`
  return (
    <div className="flex flex-col items-center gap-6 pt-8 text-center">
      <div className="relative flex size-40 items-center justify-center">
        <span className="absolute inset-0 animate-pulse rounded-full bg-accent/20 blur-2xl" />
        <div className="relative size-36 overflow-hidden rounded-full ring-1 ring-primary/20 drop-shadow-[0_8px_20px_rgba(90,56,56,0.3)]">
          <Image
            src="/money-bag.png"
            alt="Money bag"
            width={160}
            height={160}
            className="size-full object-cover"
            priority
          />
        </div>
      </div>

      <div>
        <p className="font-serif text-sm italic tracking-wide text-gold">
          Sealed with care
        </p>
        <h1 className="mt-2 text-pretty font-serif text-4xl font-semibold leading-tight text-foreground">
          Payment Submitted
        </h1>
      </div>

      <p className="mx-auto max-w-[17rem] text-pretty text-sm leading-relaxed text-muted-foreground">
        {`Thank you, ${clientName}. I can't wait to see you`}
        {time ? ` at ${time} on ${formattedDate}` : ''} . I&apos;ll confirm your appointment personally
        and send a little reminder beforehand. — {artistName}
      </p>

      <div className="mt-2 w-full rounded-3xl border border-border bg-card/60 p-5 text-left">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Appointment</span>
          <span className="font-serif text-base text-foreground">
            {time ? `${formattedDate} · ${time}` : 'To be confirmed'}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Paid</span>
          <span className="font-serif text-xl font-semibold text-gold">
            {`$${total}`}
          </span>
        </div>
      </div>
    </div>
  )
}
