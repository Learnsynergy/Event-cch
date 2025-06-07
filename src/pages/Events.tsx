import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, DollarSign, Users, Search, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Event {
  id: string
  title: string
  description: string
  location: string
  date: string
  time: string
  price: number
  available_tickets: number
  image_url: string
  organizer_id: string
  profiles: {
    full_name: string
  }
}

export function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles!events_organizer_id_fkey(full_name)
        `)
        .eq('status', 'approved')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPrice = priceFilter === 'all' || 
                        (priceFilter === 'free' && event.price === 0) ||
                        (priceFilter === 'paid' && event.price > 0)

    return matchesSearch && matchesPrice
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Découvrez des événements
              <span className="block text-violet-200">exceptionnels</span>
            </h1>
            <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
              Trouvez et réservez vos billets pour les meilleurs événements près de chez vous
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un événement ou un lieu..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
              >
                <option value="all">Tous les prix</option>
                <option value="free">Gratuit</option>
                <option value="paid">Payant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-600">
              Aucun événement ne correspond à vos critères de recherche.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="aspect-video bg-gradient-to-br from-violet-100 to-indigo-100 relative overflow-hidden">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-violet-300" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                      {format(new Date(event.date), 'dd MMM yyyy', { locale: fr })}
                    </span>
                    <span className="text-sm text-gray-500">{event.time}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      {event.available_tickets} places disponibles
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                      {event.price === 0 ? 'Gratuit' : `${event.price} FCFA`}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Par {event.profiles?.full_name}
                    </span>
                    <Link
                      to={`/events/${event.id}`}
                      className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
                    >
                      Voir détails
                    </Link>
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