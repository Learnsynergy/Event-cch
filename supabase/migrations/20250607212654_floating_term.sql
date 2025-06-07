/*
  # Configuration initiale de la base de données EventPro

  1. Nouvelles tables
    - `profiles` - Profils utilisateurs avec rôles
    - `events` - Événements créés par les organisateurs  
    - `tickets` - Billets achetés par les utilisateurs

  2. Sécurité
    - Activation RLS sur toutes les tables
    - Politiques d'accès basées sur l'authentification
    - Contraintes d'intégrité des données

  3. Fonctionnalités
    - Trigger pour création automatique des profils
    - Index pour optimiser les performances
    - Contraintes de validation des données
*/

-- Extension pour génération d'UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'organizer' CHECK (role IN ('organizer', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des événements
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  price integer NOT NULL DEFAULT 0 CHECK (price >= 0),
  max_tickets integer NOT NULL CHECK (max_tickets > 0),
  available_tickets integer NOT NULL CHECK (available_tickets >= 0),
  image_url text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  organizer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des billets
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  buyer_email text NOT NULL,
  buyer_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  total_price integer NOT NULL CHECK (total_price >= 0),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_method text NOT NULL CHECK (payment_method IN ('mtn_momo', 'visa')),
  qr_code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activation de Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Politiques RLS pour events
CREATE POLICY "Anyone can read approved events"
  ON events
  FOR SELECT
  USING (status = 'approved' OR auth.uid() = organizer_id);

CREATE POLICY "Organizers can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Politiques RLS pour tickets
CREATE POLICY "Users can read own tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (
    buyer_email = (SELECT email FROM profiles WHERE id = auth.uid())
    OR 
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = tickets.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create tickets"
  ON tickets
  FOR INSERT
  WITH CHECK (true);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'organizer'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour création automatique du profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_events
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_buyer ON tickets(buyer_email);

-- Contrainte pour s'assurer que available_tickets <= max_tickets
ALTER TABLE events ADD CONSTRAINT check_available_tickets 
  CHECK (available_tickets <= max_tickets);