import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Calendar, MapPin, DollarSign, Users, Edit, Trash2, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
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
}

interface Ticket {
  id: string
  event_id: string
  buyer_name: string
  buyer_email: string
  quantity: number
  total_price: number
  payment_status: string
  created_at: string
  events: {
    title: string
    date: string
    time: string
    location: string
  }
}

export function Dashboard() {
  const { profile } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'events' | 'tickets'>('events')

  useEffect(() => {
    if (profile) {
      fetchUserData()
    }
  }, [profile])

  const fetchUserData = async () => {
    try {
      // Fetch user's events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', profile!.id)
        .order('created_at', { ascending: false })

      if (eventsError) throw eventsError
      setEvents(eventsData || [])

      // Fetch user's tickets (if they bought any)
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          events(title, date, time, location)
        `)
        .eq('buyer_email', profile!.email)
        .order('created_at', { ascending: false })

      if (ticketsError) throw ticketsError
      setTickets(ticketsData || [])

    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      setEvents(events.filter(event => event.id !== eventId))
      toast.success('Événement supprimé avec succès')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression')
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
            Tableau de bord
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos événements et consultez vos billets
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Calendar className="w-6 h-6 text-violet-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mes événements</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Événements approuvés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mes billets</p>
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('events')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'events'
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mes événements
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tickets'
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mes billets
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'events' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Mes événements</h2>
              <Link
                to="/create-event"
                className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Créer un événement</span>
              </Link>
            </div>

            {events.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun événement créé
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez par créer votre premier événement
                </p>
                <Link
                  to="/create-event"
                  className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors inline-flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer un événement</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {events.map((event) => (
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {format(new Date(event.date), 'dd/MM/yyyy', { locale: fr })}
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
                            {event.available_tickets}/{event.max_tickets} places
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {event.status === 'approved' && (
                          <Link
                            to={`/events/${event.id}`}
                            className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                            title="Voir l'événement"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          to={`/edit-event/${event.id}`}
                          className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes billets</h2>
            
            {tickets.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun billet acheté
                </h3>
                <p className="text-gray-600">
                  Vous n'avez pas encore acheté de billets
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {ticket.events.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {format(new Date(ticket.events.date), 'dd/MM/yyyy', { locale: fr })}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {ticket.events.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            {ticket.quantity} billet{ticket.quantity > 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                            {ticket.total_price} FCFA
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            Acheté le {format(new Date(ticket.created_at), 'dd/MM/yyyy', { locale: fr })}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Confirmé
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}