import { Invitation, RSVPRegistration } from './types';

// Flyer officiel vectoriel du PNPE pour l'Ogooué-Maritime (haute fidélité)
export const DEFAULT_OFFICIAL_FLYER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0A192F"/>
      <stop offset="100%" stop-color="#050C17"/>
    </linearGradient>
    <linearGradient id="flag" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#009E60"/>
      <stop offset="33%" stop-color="#009E60"/>
      <stop offset="33%" stop-color="#FCD116"/>
      <stop offset="66%" stop-color="#FCD116"/>
      <stop offset="66%" stop-color="#3A75C4"/>
      <stop offset="100%" stop-color="#3A75C4"/>
    </linearGradient>
  </defs>

  <!-- Fond Abyssal -->
  <rect width="800" height="1000" fill="url(#bgGrad)"/>
  
  <!-- Liseré supérieur Gabon -->
  <rect width="800" height="8" fill="url(#flag)"/>

  <!-- Cadre intérieur haute précision -->
  <rect x="24" y="32" width="752" height="936" fill="none" stroke="#1E3A8A" stroke-width="1.5" stroke-opacity="0.4"/>
  <rect x="32" y="40" width="736" height="920" fill="none" stroke="#BCCCDC" stroke-width="0.75" stroke-opacity="0.2"/>

  <!-- En-tête Institutionnel -->
  <text x="400" y="90" text-anchor="middle" fill="#FFFFFF" font-family="'Times New Roman', serif" font-size="14" font-weight="600" letter-spacing="4">RÉPUBLIQUE GABONAISE</text>
  <text x="400" y="112" text-anchor="middle" fill="#94A3B8" font-family="'Helvetica Neue', sans-serif" font-size="11" letter-spacing="3">UNION - TRAVAIL - JUSTICE</text>
  <line x1="340" y1="126" x2="460" y2="126" stroke="#FCD116" stroke-width="1.5"/>

  <!-- Logo Sceau PNPE stylisé -->
  <circle cx="400" cy="180" r="34" fill="#0A192F" stroke="#FCD116" stroke-width="1.5"/>
  <text x="400" y="186" text-anchor="middle" fill="#FFFFFF" font-family="'Helvetica Neue', sans-serif" font-size="14" font-weight="800" letter-spacing="2">PNPE</text>

  <text x="400" y="240" text-anchor="middle" fill="#38BDF8" font-family="'Helvetica Neue', sans-serif" font-size="13" font-weight="600" letter-spacing="3">PÔLE NATIONAL DE PROMOTION DE L'EMPLOI</text>
  <text x="400" y="262" text-anchor="middle" fill="#CBD5E1" font-family="'Times New Roman', serif" font-style="italic" font-size="16">Direction Provinciale de l'Ogooué-Maritime</text>

  <!-- Titre Principal de l'Affiche -->
  <text x="400" y="330" text-anchor="middle" fill="#FFFFFF" font-family="'Times New Roman', serif" font-size="30" font-weight="bold">INVITATION OFFICIELLE</text>
  <text x="400" y="365" text-anchor="middle" fill="#93C5FD" font-family="'Times New Roman', serif" font-size="20">Aux Opérateurs Économiques &amp; Directeurs d'Entreprises</text>

  <line x1="120" y1="395" x2="680" y2="395" stroke="#334155" stroke-width="1"/>

  <!-- Encadré Volet 1 -->
  <rect x="70" y="425" width="660" height="190" rx="4" fill="#0F2744" stroke="#1E3A8A" stroke-width="1.5"/>
  <rect x="90" y="445" width="90" height="24" rx="2" fill="#1E3A8A"/>
  <text x="135" y="461" text-anchor="middle" fill="#FFFFFF" font-family="'Helvetica Neue', sans-serif" font-size="11" font-weight="700" letter-spacing="1">VOLET 1</text>
  <text x="195" y="462" fill="#FCD116" font-family="'Courier New', monospace" font-size="12" font-weight="bold">VENDREDI 16 OCTOBRE 2026 • 10H00</text>
  
  <text x="90" y="505" fill="#FFFFFF" font-family="'Times New Roman', serif" font-size="18" font-weight="bold">Présentation des Journées Économiques</text>
  <text x="90" y="528" fill="#93C5FD" font-family="'Times New Roman', serif" font-size="16">&amp; Forum International de l'Emploi</text>
  <text x="90" y="555" fill="#94A3B8" font-family="'Helvetica Neue', sans-serif" font-size="12">Qui se tiendra les 27 et 28 novembre 2026 à Paris</text>
  
  <circle cx="98" cy="585" r="4" fill="#009E60"/>
  <text x="110" y="589" fill="#E2E8F0" font-family="'Helvetica Neue', sans-serif" font-size="12" font-weight="600">Lieu : Centre Culturel Total • Port-Gentil</text>

  <!-- Encadré Volet 2 -->
  <rect x="70" y="640" width="660" height="190" rx="4" fill="#064E3B" fill-opacity="0.25" stroke="#065F46" stroke-width="1.5"/>
  <rect x="90" y="660" width="90" height="24" rx="2" fill="#065F46"/>
  <text x="135" y="676" text-anchor="middle" fill="#FFFFFF" font-family="'Helvetica Neue', sans-serif" font-size="11" font-weight="700" letter-spacing="1">VOLET 2</text>
  <text x="195" y="677" fill="#6EE7B7" font-family="'Courier New', monospace" font-size="12" font-weight="bold">SAMEDI 17 OCTOBRE 2026 • 09H À 17H</text>

  <text x="90" y="720" fill="#FFFFFF" font-family="'Times New Roman', serif" font-size="22" font-weight="bold">Mini-Salon de l'Emploi &amp; Recrutement Direct</text>
  <text x="90" y="748" fill="#A7F3D0" font-family="'Helvetica Neue', sans-serif" font-size="13">Rencontres B2B, espaces stands partenaires et entretiens de recrutement</text>
  
  <circle cx="98" cy="790" r="4" fill="#B45309"/>
  <text x="110" y="794" fill="#FDE68A" font-family="'Helvetica Neue', sans-serif" font-size="12" font-weight="600">Lieu : Centre Culturel Total (Négociation en cours)</text>

  <!-- Bas de page officiel -->
  <line x1="120" y1="860" x2="680" y2="860" stroke="#334155" stroke-width="1"/>
  <text x="400" y="895" text-anchor="middle" fill="#CBD5E1" font-family="'Helvetica Neue', sans-serif" font-size="13" font-weight="600">CONFIRMATION REQUISE SUR LE PORTAIL OFFICIEL DU PNPE</text>
  <text x="400" y="920" text-anchor="middle" fill="#64748B" font-family="'Courier New', monospace" font-size="11">Délégation Provinciale PNPE Ogooué-Maritime • Port-Gentil, Gabon</text>
</svg>
`)}`;

export const DEFAULT_INVITATION: Invitation = {
  id: "inv-og-2026",
  slug: "ogooue-maritime-2026",
  title: "Action auprès des opérateurs économiques de l'Ogooué-Maritime",
  organization: "Pôle National de Promotion de l'Emploi - PNPE",
  introMessage: "Dans le cadre de sa mission régalienne d'accompagnement du tissu productif national et d'insertion professionnelle, la Direction Générale du PNPE invite l'ensemble des chefs d'entreprises et directeurs des ressources humaines de la province de l'Ogooué-Maritime à participer à deux séquences de concertation et d'action stratégique.",
  imageUrl: DEFAULT_OFFICIAL_FLYER,
  displayLargeImage: true,
  status: "active",
  volets: [
    {
      id: "volet-1",
      badge: "Volet 1",
      theme: "blue",
      title: "Présentation des Journées Économiques et du Forum International de l'Emploi (27 et 28 novembre 2026 à Paris)",
      date: "Vendredi 16 octobre 2026",
      time: "À 10h00",
      location: "Centre Culturel Total",
      locationStatus: "confirmed",
      description: "Présentation exclusive des opportunités d'investissement, de sponsoring et de visibilité internationale pour les entreprises gabonaises lors des Journées Économiques à Paris. Échanges stratégiques de haut niveau avec la direction du PNPE."
    },
    {
      id: "volet-2",
      badge: "Volet 2",
      theme: "emerald",
      title: "Mini-salon de l'emploi",
      date: "Samedi 17 octobre 2026",
      time: "De 9h à 17h",
      location: "Centre Culturel Total",
      locationStatus: "negotiation",
      description: "Plateforme opérationnelle de recrutement direct, mise en relation qualifiée entre entreprises locales et demandeurs d'emploi certifiés. Possibilité de réserver un stand d'entreprise dédié."
    }
  ],
  createdAt: "2026-10-10T08:00:00.000Z",
  updatedAt: "2026-10-14T09:00:00.000Z"
};

export const DEFAULT_RSVPS: RSVPRegistration[] = [
  {
    id: "rsvp-1",
    invitationId: "inv-og-2026",
    confirmationCode: "PNPE-OG-7842",
    company: "Perenco Gabon S.A.",
    participantName: "Marc Obame",
    jobTitle: "Directeur des Ressources Humaines",
    phone: "+24177123456",
    email: "marc.obame@perenco-gabon.com",
    volets: ["volet-1", "volet-2"],
    attendeesCount: 3,
    comments: "Nous sollicitons un stand de 12m² pour nos équipes de recrutement technique lors du mini-salon du samedi.",
    createdAt: "2026-10-11T14:22:10.000Z"
  },
  {
    id: "rsvp-2",
    invitationId: "inv-og-2026",
    confirmationCode: "PNPE-OG-9104",
    company: "TotalEnergies EP Gabon",
    participantName: "Sylvie Mboumba",
    jobTitle: "Responsable Relations Institutionnelles",
    phone: "+24166234567",
    email: "sylvie.mboumba@totalenergies.ga",
    volets: ["volet-1"],
    attendeesCount: 2,
    comments: "Délégation conjointe Direction Générale et RSE pour la présentation des Journées de Paris.",
    createdAt: "2026-10-12T09:45:00.000Z"
  },
  {
    id: "rsvp-3",
    invitationId: "inv-og-2026",
    confirmationCode: "PNPE-OG-4519",
    company: "Assala Energy Gabon",
    participantName: "Blandine Ntoutoume",
    jobTitle: "Directrice Générale Adjointe",
    phone: "+24174345678",
    email: "b.ntoutoume@assalaenergy.com",
    volets: ["volet-2"],
    attendeesCount: 4,
    comments: "Réservation de stand confirmée. Nous prévoyons 15 entretiens d'embauche sur place.",
    createdAt: "2026-10-12T16:10:35.000Z"
  },
  {
    id: "rsvp-4",
    invitationId: "inv-og-2026",
    confirmationCode: "PNPE-OG-6381",
    company: "Société Gabonaise de Raffinage (SOGARA)",
    participantName: "Patrick Moundounga",
    jobTitle: "Chef Département Formation & Recrutement",
    phone: "+24165456789",
    email: "p.moundounga@sogara-gabon.ga",
    volets: ["volet-1", "volet-2"],
    attendeesCount: 2,
    comments: "Partenariat PNPE actif. Présence aux deux journées.",
    createdAt: "2026-10-13T11:05:12.000Z"
  },
  {
    id: "rsvp-5",
    invitationId: "inv-og-2026",
    confirmationCode: "PNPE-OG-3290",
    company: "Gabon Port Management (GPM - Port-Gentil)",
    participantName: "Christian Ndong",
    jobTitle: "Responsable d'Exploitation Portuaire",
    phone: "+24177567890",
    email: "c.ndong@gpm-og.com",
    volets: ["volet-1"],
    attendeesCount: 1,
    comments: "Intéressé par la mobilisation de compétences pour les métiers logistiques.",
    createdAt: "2026-10-14T08:30:40.000Z"
  }
];
