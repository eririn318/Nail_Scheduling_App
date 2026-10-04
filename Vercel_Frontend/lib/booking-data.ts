export type Service = {
  serviceId: string // Legacy / hardcoded mock ID
  name: string
  description: string
  price: number//price calculation
  duration: string//display to the client
  durationMinutes: number//service minutes calculation
  bufferMinutes: number//extra minutes calculation
  isMobile: boolean
  _id?: string // MongoDB auto-generated ID (from live backend)
  id?: string //Generic fallback ID
}

export type Booking = {
  clientName: string
  artistName: string
  venmoHandle: string
  zelleContact: string
  services: Service[]
  timeSlots: string[]
}

// Pre-arranged private booking — filled in ahead of time by Eriko.
export const booking: Booking = {
  clientName: 'Sophia',
  artistName: 'Eriko',
  venmoHandle: '@eripu318',
  zelleContact: '213-840-6072',
  services: [
    {
      serviceId: 'gel-mani',
      name: 'Signature Gel Manicure',
      description: 'Shaped, cuticle care & long-wear gel finish',
      price: 85,
      duration: '75 min',
      durationMinutes: 75,
      bufferMinutes: 15
    },
    {
      serviceId: 'nail-art',
      name: 'Hand-Painted Nail Art',
      description: 'Bespoke detailing designed just for you',
      price: 60,
      duration: '45 min',
      durationMinutes: 45,
      bufferMinutes: 15
    },
    {
      serviceId: 'spa-pedi',
      name: 'Luxury Spa Pedicure',
      description: 'Warm soak, exfoliation & gel color',
      price: 95,
      duration: '60 min', //to display
      durationMinutes: 60, //to calculate
      bufferMinutes: 15 //to calculate
    },
  ],
  timeSlots: [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:30 PM',
  ],
}
