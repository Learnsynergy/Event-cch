import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, DollarSign, Users, Clock, User, CreditCard, Smartphone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

interface Event {
  id: string
  title: string
  description: string
  location: string
  date: string
  time: string
  price: number
  max_tickets: number
  available_tickets: number
  image_url: string
  organizer_id: string
  profiles: {
    full_name: string
    email: string
  }
}

interface PurchaseForm {
  buyer_name: string
  buyer_email: string
  quantity: number
  payment_method: 'mtn_momo' | 'visa'
}

export function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PurchaseForm>({
    defaultValues: {
      quantity: 1,
      payment_method: 'visa'
    }
  })

  useEffect(() => {
    if (id) {
      fetchEvent()
    }
  }, [id])

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles!events_organizer_id_fkey(full_name, email)
        `)
        .eq('id', id)
        .eq('status', 'approved')
        .single()

      if (error) throw error
      setEvent(data)
    } catch (error) {
      console.error('Error fetching event:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: PurchaseForm) => {
    if (!event) return

    setPurchasing(true)
    try {
      // Generate QR code
      const ticketData = {
        eventId: event.id,
        eventTitle: event.title,
        buyerName: data.buyer_name,
        buyerEmail: data.buyer_email,
        quantity: data.quantity,
        purchaseDate: new Date().toISOString()
      }
      
      const qrCode = await QRCode.toDataURL(JSON.stringify(ticketData))

      // Save ticket to database
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          event_id: event.id,
          buyer_email: data.buyer_email,
          buyer_name: data.buyer_name,
          quantity: data.quantity,
          total_price: event.price * data.quantity,
          payment_method: data.payment_method,
          payment_status: 'completed', // In real app, this would be pending until payment is confirmed
          qr_code: qrCode
        })
        .select()
        .single()

      if (error) throw error

      // Update available tickets
      const { error: updateError } = await supabase
        .from('events')
        .update({
          available_tickets: event.available_tickets - data.quantity
        })
        .eq('id', event.id)

      if (updateError) throw updateError

      toast.success('Billet acheté avec succès!')
      setShowPurchaseForm(false)
      
      // In a real app, redirect to ticket page or send email with QR code
      console.log('Ticket purchased:', ticket)
      
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'achat')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Événement non trouvé</h2>
          <p className="text-gray-600">L'événement que vous recherchez n'existe pas.</p>
        </div>
      </div>
    )
  }

  const quantity = watch('quantity') || 1
  const totalPrice = event.price * quantity

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Event Image */}
          <div className="aspect-video bg-gradient-to-br from-violet-100 to-indigo-100 relative">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="w-24 h-24 text-violet-300" />
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Event Details */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800 mb-4">
                    {format(new Date(event.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {event.title}
                  </h1>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-semibold text-gray-900">
                        {format(new Date(event.date), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <Clock className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Heure</p>
                      <p className="font-semibold text-gray-900">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lieu</p>
                      <p className="font-semibold text-gray-900">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <User className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Organisateur</p>
                      <p className="font-semibold text-gray-900">{event.profiles?.full_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Card */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 sticky top-8">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {event.price === 0 ? 'Gratuit' : `${event.price} FCFA`}
                    </div>
                    {event.price > 0 && (
                      <p className="text-sm text-gray-500">par billet</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">Places disponibles</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {event.available_tickets}
                    </span>
                  </div>

                  {event.available_tickets > 0 ? (
                    <>
                      {!showPurchaseForm ? (
                        <button
                          onClick={() => setShowPurchaseForm(true)}
                          className="w-full bg-violet-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-violet-700 transition-colors"
                        >
                          {event.price === 0 ? 'Réserver gratuitement' : 'Acheter un billet'}
                        </button>
                      ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom complet
                            </label>
                            <input
                              {...register('buyer_name', { required: 'Nom requis' })}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                            {errors.buyer_name && (
                              <p className="text-sm text-red-600 mt-1">{errors.buyer_name.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              {...register('buyer_email', { 
                                required: 'Email requis',
                                pattern: {
                                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                  message: 'Email invalide'
                                }
                              })}
                              type="email"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                            {errors.buyer_email && (
                              <p className="text-sm text-red-600 mt-1">{errors.buyer_email.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre de billets
                            </label>
                            <select
                              {...register('quantity', { required: true, min: 1 })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            >
                              {Array.from({ length: Math.min(10, event.available_tickets) }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1} billet{i > 0 ? 's' : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          {event.price > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mode de paiement
                              </label>
                              <div className="space-y-2">
                                <label className="flex items-center">
                                  <input
                                    {...register('payment_method')}
                                    type="radio"
                                    value="visa"
                                    className="mr-2"
                                  />
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Carte bancaire (Visa)
                                </label>
                                <label className="flex items-center">
                                  <input
                                    {...register('payment_method')}
                                    type="radio"
                                    value="mtn_momo"
                                    className="mr-2"
                                  />
                                  <Smartphone className="w-4 h-4 mr-2" />
                                  MTN Mobile Money
                                </label>
                              </div>
                            </div>
                          )}

                          {event.price > 0 && (
                            <div className="bg-white p-4 rounded-lg border">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total à payer</span>
                                <span className="text-lg font-bold text-gray-900">
                                  {totalPrice} FCFA
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={() => setShowPurchaseForm(false)}
                              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              Annuler
                            </button>
                            <button
                              type="submit"
                              disabled={purchasing}
                              className="flex-1 bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {purchasing ? 'Traitement...' : (event.price === 0 ? 'Réserver' : 'Payer')}
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-red-600 font-semibold mb-2">Complet</p>
                      <p className="text-sm text-gray-500">Plus de places disponibles</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}