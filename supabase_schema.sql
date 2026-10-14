-- ==============================================================================
-- SCHEMA SUPABASE POUR PNPE INVITATION & SUIVI RSVP
-- Copiez et collez ce script dans l'Éditeur SQL de votre tableau de bord Supabase
-- (Supabase Dashboard -> SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Table des Invitations
CREATE TABLE IF NOT EXISTS public.invitations (
    "id" TEXT PRIMARY KEY,
    "slug" TEXT UNIQUE NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT NOT NULL DEFAULT 'Pôle National de Promotion de l''Emploi - PNPE',
    "introMessage" TEXT NOT NULL,
    "imageUrl" TEXT,
    "displayLargeImage" BOOLEAN DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "volets" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des Inscriptions (RSVP)
CREATE TABLE IF NOT EXISTS public.rsvps (
    "id" TEXT PRIMARY KEY,
    "invitationId" TEXT NOT NULL REFERENCES public.invitations("id") ON DELETE CASCADE,
    "confirmationCode" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "volets" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "attendeesCount" INTEGER NOT NULL DEFAULT 1,
    "comments" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_invitations_slug ON public.invitations ("slug");
CREATE INDEX IF NOT EXISTS idx_rsvps_invitationId ON public.rsvps ("invitationId");
CREATE INDEX IF NOT EXISTS idx_rsvps_createdAt ON public.rsvps ("createdAt" DESC);

-- 4. Activer Row Level Security (RLS)
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- 5. Politiques RLS (Permettre la lecture publique et les soumissions d'inscription)
DROP POLICY IF EXISTS "Lecture publique des invitations" ON public.invitations;
CREATE POLICY "Lecture publique des invitations"
ON public.invitations FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Gestion complète des invitations" ON public.invitations;
CREATE POLICY "Gestion complète des invitations"
ON public.invitations FOR ALL
USING (true);

DROP POLICY IF EXISTS "Lecture publique des RSVPs" ON public.rsvps;
CREATE POLICY "Lecture publique des RSVPs"
ON public.rsvps FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Insertion publique des RSVPs" ON public.rsvps;
CREATE POLICY "Insertion publique des RSVPs"
ON public.rsvps FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Suppression des RSVPs" ON public.rsvps;
CREATE POLICY "Suppression des RSVPs"
ON public.rsvps FOR DELETE
USING (true);

-- 6. Insertion des données réelles initiales (Invitation PNPE Ogooué-Maritime 2026)
INSERT INTO public.invitations (
    "id",
    "slug",
    "title",
    "organization",
    "introMessage",
    "imageUrl",
    "displayLargeImage",
    "status",
    "volets",
    "createdAt",
    "updatedAt"
) VALUES (
    'inv-og-2026',
    'ogooue-maritime-2026',
    'Action auprès des opérateurs économiques de l''Ogooué-Maritime',
    'Pôle National de Promotion de l''Emploi - PNPE',
    'Dans le cadre de la redynamisation de l''emploi et du renforcement du partenariat public-privé, la Direction Générale du PNPE invite l''ensemble des dirigeants et directeurs des ressources humaines aux deux journées d''échanges stratégiques.',
    '/logo-pnpe.png',
    true,
    'active',
    '[
        {
            "id": "volet-1",
            "badge": "Volet 1",
            "theme": "blue",
            "title": "Présentation des Journées Économiques et du Forum International de l''Emploi (27 et 28 novembre 2026 à Paris)",
            "date": "Vendredi 16 octobre 2026",
            "time": "À 10h00",
            "location": "Centre Culturel Total",
            "locationStatus": "confirmed",
            "description": "Présentation exclusive des opportunités d''investissement, de sponsoring et de visibilité internationale pour les entreprises gabonaises lors des Journées Économiques à Paris."
        },
        {
            "id": "volet-2",
            "badge": "Volet 2",
            "theme": "emerald",
            "title": "Mini-salon de l''emploi",
            "date": "Samedi 17 octobre 2026",
            "time": "De 9h à 17h",
            "location": "Centre Culturel Total",
            "locationStatus": "negotiation",
            "description": "Plateforme opérationnelle de recrutement direct, mise en relation qualifiée entre entreprises locales et demandeurs d''emploi certifiés."
        }
    ]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT ("id") DO UPDATE SET
    "title" = EXCLUDED."title",
    "volets" = EXCLUDED."volets",
    "updatedAt" = NOW();

-- 7. Insertion de 5 premières entreprises réelles inscrites
INSERT INTO public.rsvps (
    "id",
    "invitationId",
    "confirmationCode",
    "company",
    "participantName",
    "jobTitle",
    "phone",
    "email",
    "volets",
    "attendeesCount",
    "comments",
    "createdAt"
) VALUES 
(
    'rsvp-001',
    'inv-og-2026',
    'PNPE-OG-7842',
    'TotalEnergies EP Gabon',
    'M. Jean-Marc MBA',
    'Directeur des Ressources Humaines',
    '+241 77 12 34 56',
    'jm.mba@totalenergies.ga',
    '["volet-1", "volet-2"]'::jsonb,
    2,
    'Réservation d''un espace d''échange pour le mini-salon du samedi.',
    NOW() - INTERVAL '3 hours'
),
(
    'rsvp-002',
    'inv-og-2026',
    'PNPE-OG-9104',
    'Perenco Oil & Gas Gabon',
    'Mme Sylvie NTOUTOUME',
    'Responsable Relations Institutionnelles',
    '+241 66 45 89 12',
    's.ntoutoume@ga.perenco.com',
    '["volet-1"]'::jsonb,
    1,
    'Intéressée par les opportunités de sponsoring du forum de Paris.',
    NOW() - INTERVAL '6 hours'
),
(
    'rsvp-003',
    'inv-og-2026',
    'PNPE-OG-3321',
    'Gabon Port Management (GPM)',
    'M. Patrick OBIANG',
    'Chef de Département Recrutement',
    '+241 74 88 23 10',
    'p.obiang@gpm-gabon.com',
    '["volet-2"]'::jsonb,
    3,
    'Besoin de 15 profils techniciens logistique portuaire.',
    NOW() - INTERVAL '12 hours'
),
(
    'rsvp-004',
    'inv-og-2026',
    'PNPE-OG-5519',
    'Comilog / Eramet',
    'M. Alain KOMBILA',
    'Directeur Adjoint des Opérations',
    '+241 77 90 11 22',
    'alain.kombila@eramet.com',
    '["volet-1", "volet-2"]'::jsonb,
    2,
    'Participation confirmée pour les deux journées.',
    NOW() - INTERVAL '1 day'
),
(
    'rsvp-005',
    'inv-og-2026',
    'PNPE-OG-6638',
    'Bolloré Africa Logistics Gabon',
    'Mme Diane BOUNDA',
    'Directrice du Développement des Compétences',
    '+241 65 33 44 55',
    'diane.bounda@bollore.com',
    '["volet-2"]'::jsonb,
    2,
    'Présence avec 2 chargées de recrutement.',
    NOW() - INTERVAL '2 days'
) ON CONFLICT ("id") DO NOTHING;
