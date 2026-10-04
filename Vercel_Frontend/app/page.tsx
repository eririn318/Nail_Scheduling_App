import { BookingFlow } from '@/components/booking/booking-flow'

export default function Page() {
  return (
    <div className="flex min-h-[100dvh] justify-center bg-secondary/40">
      <div className="w-full max-w-[26rem] shadow-[0_0_60px_-20px_rgba(80,40,20,0.4)]">
        <BookingFlow />
      </div>
    </div>
  )
}
