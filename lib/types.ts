export type VoletTheme = 'blue' | 'emerald';
export type LocationStatus = 'confirmed' | 'negotiation';

export interface VoletConfig {
  id: string;
  badge: string;            // ex: "Volet 1", "Volet 2"
  theme: VoletTheme;        // 'blue' (Bleu Souverain) ou 'emerald' (Vert Émeraude)
  title: string;            // Objet du rendez-vous
  date: string;             // ex: "Vendredi 16 octobre 2026"
  time: string;             // ex: "À 10h00" ou "De 9h à 17h"
  location: string;         // ex: "Centre Culturel Total"
  locationStatus: LocationStatus; // "confirmed" | "negotiation"
  description?: string;
  imageUrl?: string;        // Visuel / Image spécifique de l'activité
}

export interface Invitation {
  id: string;
  slug: string;             // ex: "ogooue-maritime-2026"
  title: string;
  organization: string;     // "Pôle National de Promotion de l'Emploi - PNPE"
  introMessage: string;
  imageUrl?: string;        // Base64 ou URL de l'affiche officielle
  displayLargeImage: boolean;
  status: 'active' | 'closed';
  volets: VoletConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface RSVPRegistration {
  id: string;
  invitationId: string;
  confirmationCode: string; // ex: "PNPE-OG-7842"
  company: string;
  participantName: string;
  jobTitle: string;
  phone: string;
  email: string;
  volets: string[];         // IDs des volets choisis: ['volet-1'], ['volet-2'] ou les deux
  attendeesCount: number;   // 1 à 5
  comments?: string;
  createdAt: string;
}

export type MemberRole = 'superadmin' | 'admin' | 'viewer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  password?: string;
  createdAt: string;
  addedBy?: string;
}

export interface AdminUser {
  id?: string;
  email: string;
  role: MemberRole;
  name: string;
}

export interface StoreState {
  invitations: Invitation[];
  rsvps: RSVPRegistration[];
  members?: TeamMember[];
}
