import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Calendar, MapPin, DollarSign, Users, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

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
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  profiles: {
    full_name: string
    email: string
  }
}

export function Admin() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles!events_organizer_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Erreur lors du chargement des événements')
    } finally {
      setLoading(false)
    }
  }

  const updateEventStatus = async (eventId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', eventId)

      if (error) throw error

      setEvents(events.map(event => 
        event.id === eventId ? { ...event, status } : event
      ))

      toast.success(
        status === 'approved' 
          ? 'Événement approuvé avec succès' 
          : 'Événement rejeté'
      )
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">En attente</span>
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approuvé</span>
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejeté</span>
      default:
        return null
    }
  }

  const filteredEvents = events.filter(event => 
    filter === 'all' || event.status === filter
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Administration des événements
          </h1>
          <p className="text-gray-600 mt-2">
            Validez ou rejetez les événements soumis par les organisateurs
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approuvés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejetés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'pending', label: 'En attente' },
              { key: 'approved', label: 'Approuvés' },
              { key: 'rejected', label: 'Rejetés' }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as typeof filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === item.key
                    ? 'bg-violet-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-600">
              Aucun événement ne correspond aux critères sélectionnés
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      {getStatusBadge(event.status)}
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {format(new Date(event.date), 'dd/MM/yyyy', { locale: fr })} à {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                        {event.price === 0 ? 'Gratuit' : `${event.price} FCFA`}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        {event.max_tickets} places
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <p>Organisateur: <span className="font-medium">{event.profiles?.full_name}</span></p>
                        <p>Email: <span className="font-medium">{event.profiles?.email}</span></p>
                        <p>Créé le: {format(new Date(event.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
                      </div>

                      {event.status === 'pending' && (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateEventStatus(event.id, 'rejected')}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Rejeter</span>
                          </button>
                          <button
                            onClick={() => updateEventStatus(event.id, 'approved')}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approuver</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}