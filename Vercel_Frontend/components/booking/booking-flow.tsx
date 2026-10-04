'use client'

import { useMemo, useState, useEffect } from 'react'
import { booking } from '@/lib/booking-data'
import { WelcomeStep } from './welcome-step'
import { TimeStep } from './time-step'
import { PaymentStep } from './payment-step'
import { ConfirmationStep } from './confirmation-step'
import { ChatButton } from './chat-button'
import type {Service} from "@/lib/booking-data"


type Step = 'welcome' | 'time' | 'payment' | 'confirmation'

const STEPS: Step[] = ['welcome', 'time', 'payment', 'confirmation']

export function BookingFlow({token}: {token: string}) {//destructure token from token/page.tsx
  const [step, setStep] = useState<Step>('welcome')
  const [time, setTime] = useState<string | null>(null)
  const [name, setName] = useState("Client")
  const [service, setServices] = useState<Service[]>([])//type Service from lib/booking-data  
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [bufferMinutes, setBufferMinutes] = useState(0)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [openSlot, setOpenSlot] = useState<string[]>([])
  const [date, setDate] = useState("") //date is current stored value, setDate is function you call to change that value

// useEffect automatically fetches the client's data — using the token from her URL — the moment the page loads, and would only run again if token ever changed."  
// Fetch this client's data (name and services), using the token pulled from her private booking URL that I created link for the client
  // useEffect (()=>{
  // async function getData() {
  //     const response = await fetch(`http://localhost:4000/clients/booking/${token}`)//fetch backend
  //     const data = await response.json()
  //     console.log(data)
  //     setName(data.name)
  //     setServices(data.services || []) //stores client's full service list //1. shows client's full service list
  //     setSelectedServices(data.services.map((s: Service) => s.serviceId))//pre-selects all of them by default, using each one's already-existing serviceId //2. pre-selects all of the listed services // to pick services from the list each (not selected all only)
  //     setDurationMinutes(data.durationMinutes)
  //     setBufferMinutes(data.bufferMinutes)
  //     // data from backend/routes/clients.js/ -> GET "/booking/:token"
  //   }
  // getData()
  // }, [token]) //run when token changes

  useEffect(() => {
  async function getData() {
    try {
      const response = await fetch(`http://localhost:4000/clients/booking/${token}`)
      const data = await response.json()

      setName(data.name || "Client")
      setServices(data.services || []) // ★ Fallback to empty array

      // Safe mapping with optional chaining
      if (Array.isArray(data.services)) {
        setSelectedServices(
          data.services.map((s: Service) => s.serviceId || '')
        )
      } else {
        setSelectedServices([])
      }

      setDurationMinutes(data.durationMinutes || 0)
      setBufferMinutes(data.bufferMinutes || 0)
    } catch (err) {
      console.error("Failed to load booking data:", err)
    }
  }

  if (token) getData()
}, [token])

  const chosenServices = useMemo(
    () => service.filter((s) => selectedServices.includes(s.serviceId)),//id is the service's identifier from lib/booking-data
    [service, selectedServices],
  )
  const total = useMemo(//useMemo -> Remember this calculation result until the dependency changes
    () => chosenServices.reduce((sum, s) => sum + s.price, 0),//price is the service's identifier from lib/booking-data
    [chosenServices],//recalculate when chosenServices changes
  )

  const totalDurationMinutes = useMemo(
    () => chosenServices.reduce((sum, s) => sum + s.durationMinutes, 0),//s.durationMinutes is the services's identifier(type Service ) from lib/booking-data
    [chosenServices]
  )

  const totalBufferMinutes = useMemo(
    () => chosenServices.reduce((sum, s) => sum + s.bufferMinutes, 0),
  [chosenServices]
)

console.log("DEBUG chosenServices:", chosenServices)

chosenServices.forEach((s) => {
  console.log(
    s.name,
    "durationMinutes =", s.durationMinutes,
    "bufferMinutes =", s.bufferMinutes,
    "isMobile =", s.isMobile
  )
})

// selectedServices  ← STATE
//        ↓
// chosenServices    ← CALCULATED(useMemo)
//        ↓
//  ┌─────┼───────────┐
//  ↓     ↓           ↓
// price duration   buffer
//  ↓     ↓           ↓
// total totalDuration totalBuffer
  
  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-background">
      {/* soft warm glow accents */}
      <div className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -left-16 size-64 rounded-full bg-primary/10 blur-3xl" />

      {/* progress */}
      <div className="relative z-10 flex justify-center gap-2 px-6 pt-6">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`h-1 rounded-full transition-all duration-300 ${
              i <= stepIndex ? 'w-8 bg-primary' : 'w-4 bg-border'
            }`}
          />
        ))}
      </div>

      <main className="relative z-10 flex-1 px-6 pb-4 pt-6">
        {step === 'welcome' && (
          <WelcomeStep
            clientName={name}//name from useState
            artistName={booking.artistName}
            services={service || []}//service from useState
            selected={selectedServices || []}
            onToggle={toggleService}
            onContinue={() => setStep('time')}
            durationMinutes={durationMinutes}
            totalDurationMinutes={totalDurationMinutes}
  />
        )}
        {step === 'time' && (
          <TimeStep
            slots={booking.timeSlots}
            selected={time}
            onSelect={setTime}
            onBack={() => setStep('welcome')}
            onContinue={() => setStep('payment')}
            durationMinutes={totalDurationMinutes}//durationMinutes is state, it added here as props and will send to time-step.tsx 
            bufferMinutes={totalBufferMinutes}
            onDateSelect = {setDate}//date selected from calendar //when called, changes what date holds
          />
        )}
        {step === 'payment' && (
          <PaymentStep
            services={chosenServices}
            time={time}
            total={total}
            venmoHandle={booking.venmoHandle}
            zelleContact={booking.zelleContact}
            onBack={() => setStep('time')}
            onPaid={() => setStep('confirmation')}
            date={date}//date will show on the page //holds the current date string 
          />
        )}
        {step === 'confirmation' && (
          <ConfirmationStep
            clientName={name}//name from useState
            artistName={booking.artistName}
            time={time}
            total={total}
            date={date}//date will show on the page
          />
        )}
      </main>

      <div className="relative z-10 px-6">
        <ChatButton artistName={booking.artistName} />
      </div>
    </div>
  )
}


// ============ date in payment page ============
// ✅ onDateSelect: (date: string) => void — correct type signature (takes a string, returns nothing)
// ✅ Destructured in TimeStep's function parameters
// ✅ Called inside onChange, passing the newly selected date
// ✅ date/setDate state created in BookingFlow
// ✅ onDateSelect={setDate} passed down as a prop to <TimeStep />
// ✅ When TimeStep calls onDateSelect(...), it's really calling setDate(...) (since that's what got passed in) — updating BookingFlow's state
// ✅ date={date} passed down to <PaymentStep />
// ✅ date: string added to PaymentStep's Props type
// ✅ Destructured in PaymentStep's function parameters
// ✅ {date} displayed in the JSX

// parent 
// booking-flow.tsx
  // <TimeStep onDateSelect = {setDate}/>
  // <PaymentStep  date={date}/>


// children
// time-step.tsx -> pass onDateSelect :to update selected date
// payment-step.tsx -> pass date :to display on payment page