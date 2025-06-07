import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Calendar, MapPin, DollarSign, Users, Clock, FileText, Image } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface EventForm {
  title: string
  description: string
  location: string
  date: string
  time: string
  price: number
  max_tickets: number
  image_url: string
}

export function CreateEvent() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EventForm>()

  const onSubmit = async (data: EventForm) => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from('events')
        .insert({
          title: data.title,
          description: data.description,
          location: data.location,
          date: data.date,
          time: data.time,
          price: data.price,
          max_tickets: data.max_tickets,
          available_tickets: data.max_tickets,
          image_url: data.image_url,
          organizer_id: profile.id,
          status: 'pending'
        })

      if (error) throw error

      toast.success('Événement créé avec succès! Il sera visible après validation.')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de l\'événement')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Créer un événement
            </h1>
            <p className="text-gray-600 mt-2">
              Remplissez les informations de votre événement. Il sera soumis pour validation avant d'être publié.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'événement *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('title', { 
                    required: 'Le titre est requis',
                    minLength: {
                      value: 5,
                      message: 'Le titre doit contenir au moins 5 caractères'
                    }
                  })}
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Ex: Concert de jazz au parc"
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { 
                  required: 'La description est requise',
                  minLength: {
                    value: 20,
                    message: 'La description doit contenir au moins 20 caractères'
                  }
                })}
                rows={4}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Décrivez votre événement..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Lieu *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('location', { required: 'Le lieu est requis' })}
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Ex: Salle de concert, Abidjan"
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('date', { 
                      required: 'La date est requise',
                      validate: (value) => {
                        const today = new Date().toISOString().split('T')[0]
                        if (value < today) {
                          return 'La date ne peut pas être dans le passé'
                        }
                      }
                    })}
                    type="date"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Heure *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('time', { required: 'L\'heure est requise' })}
                    type="time"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>
            </div>

            {/* Price and Tickets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Prix du billet (FCFA) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('price', { 
                      required: 'Le prix est requis',
                      min: {
                        value: 0,
                        message: 'Le prix ne peut pas être négatif'
                      }
                    })}
                    type="number"
                    min="0"
                    step="500"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="0 pour gratuit"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="max_tickets" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de places *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('max_tickets', { 
                      required: 'Le nombre de places est requis',
                      min: {
                        value: 1,
                        message: 'Il faut au moins 1 place'
                      }
                    })}
                    type="number"
                    min="1"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Ex: 100"
                  />
                </div>
                {errors.max_tickets && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_tickets.message}</p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                URL de l'image (optionnel)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Image className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('image_url')}
                  type="url"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Ajoutez une URL d'image pour illustrer votre événement
              </p>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Création...' : 'Créer l\'événement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}