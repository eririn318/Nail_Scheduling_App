'use client'

import { ChevronLeft } from 'lucide-react'
import {useState} from 'react'
import {useEffect} from 'react'

type Props = {
  slots: string[]
  selected: string | null
  onSelect: (slot: string) => void
  onBack: () => void
  onContinue: () => void
  bufferMinutes: number //create type for typeScript
  durationMinutes: number
  onDateSelect: (date: string) => void // describes a function that will be called with a new date string as input, and returns nothing — the actual updating happens wherever this function is defined (e.g., setDate)
  }

export function TimeStep({ slots, selected, onSelect, onBack, onContinue, bufferMinutes, durationMinutes, onDateSelect }: Props) {//add distract type as Props(received from booking-flow.tsx <TimeStep />)
  const [date, setDate] = useState("")
  const [openSlot, setOpenSlot] = useState<string[]>([])

    useEffect (()=>{
      //date is useState
        if(!date) return //don't fetch if no date picked yet
  
        async function getSlot() {
        const response = await fetch(`http://localhost:4000/calendar/available?date=${date}&durationMinutes=${durationMinutes}&bufferMinutes=${bufferMinutes}`)//fetch backend from calendar.js
          const data = await response.json()
          setOpenSlot(data.openSlots)// ★ store the real slots — get data from backend == res.json({date, openSlots}) / ==calendar.js ==
      }
      getSlot()
      }, [date])//run when date changes

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
          Reserve your moment
        </p>
        <h1 className="mt-1 text-pretty font-serif text-3xl font-semibold leading-tight text-foreground">
          Select a date
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {date && openSlot.length//date is the same state variable used in value={date}(connect to <input value={date} />)
          ? (() => {
            const [year, month, day] = date.split('-').map(Number)// ★ split "2026-09-15" into separate numbers, avoiding the UTC string-parsing bug(which is 1 day differences from calendar)
            return new Date(year, month - 1, day).toLocaleDateString('en-US', {//format Monday, September 14 -> build Date from local numbers, not a raw string
            weekday: 'long', //long = use full word "Monday"
            month:'long', 
            day: 'numeric'
          }) 
        }) ()//(() => { ... })() is called an immediately-invoked function expression — it's a mini-function that runs itself right away, letting us write multiple lines of logic and return a single result, all within one JSX expression slot.
          : 'There is no available time slots, please select another date'} · at Eriko&apos;s studio
        </p>
      </header>
      <input 
      type="date" //to add calendar
      value={date}//date is useState, reads the current value of the date state
      onChange={(e) => {
        setDate(e.target.value)//updates that same date state variable
        onDateSelect(e.target.value)//for payment page's date
      }}
      />
      <div className="grid grid-cols-2 gap-3">

        {/* openSlot holds all the real calculated open times */}
        {openSlot.map((slot) => {//.map handles turning "one array" into "one button per array item" for you
          const isSelected = slot === selected
          return (
            <button
              key={slot}//connecting each slot to its own button
              type="button"
              onClick={() => onSelect(slot)}
              aria-pressed={isSelected}//selected time
              className={`rounded-2xl border py-4 font-serif text-lg transition-all duration-200 ${
                isSelected//clicked selected time will change color
                  ? 'border-primary bg-primary text-primary-foreground shadow-[0_10px_26px_-14px_rgba(120,30,30,0.7)]'
                  : 'border-border bg-card/60 text-foreground hover:bg-card'
              }`}
            >
              {slot}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!selected}
        className="w-full rounded-full bg-primary py-4 font-medium tracking-wide text-primary-foreground shadow-[0_12px_30px_-14px_rgba(120,30,30,0.7)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue to payment
      </button>
    </div>
  )
}
