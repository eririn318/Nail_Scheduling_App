import { BookingFlow } from '@/components/booking/booking-flow'

export default async function Page({params}: {params: Promise<{token: string}>}) {//receive params(token from the URL that I created to the client), with its type: an object containing a token string
  const {token} = await params //get params and put it inside token
  return (
    <div className="flex min-h-[100dvh] justify-center bg-secondary/40">
      <div className="w-full max-w-[26rem] shadow-[0_0_60px_-20px_rgba(80,40,20,0.4)]">
        <BookingFlow token = {token}/> 
        {/* passing the real token from the URL */}
      </div>
    </div>
  )
}
