import { RSVPRegistration, Invitation } from './types';

export function exportRSVPsToCSV(rsvps: RSVPRegistration[], invitation?: Invitation | null): void {
  // BOM UTF-8 pour forcer Excel à afficher correctement les caractères accentués en français
  const BOM = '\uFEFF';

  const headers = [
    "Date d'enregistrement",
    "Code Confirmation",
    "Demandeur d'emploi (Nom & Prénom)",
    "Profil / Métier",
    "Numéro PNPE",
    "Contact / Téléphone",
    "Email",
    "Participation Activité 1",
    "Participation Activité 2",
    "Commentaires & Détails",
    "Émargement Jour J"
  ];

  const rows = rsvps.map((r) => {
    const dateFormatted = new Date(r.createdAt).toLocaleString('fr-FR', {
      timeZone: 'Africa/Libreville',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const isVolet1 = r.volets && r.volets.includes('volet-1') ? 'OUI' : 'NON';
    const isVolet2 = r.volets && r.volets.includes('volet-2') ? 'OUI' : 'NON';

    const pnpeNumber = r.comments?.includes('Numéro PNPE :')
      ? r.comments.replace('Numéro PNPE :', '').trim()
      : r.company?.includes('N° PNPE:')
      ? r.company.split('N° PNPE:')[1]?.replace(')', '').trim()
      : '';

    const escape = (val: string | number | undefined) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      escape(dateFormatted),
      escape(r.confirmationCode),
      escape(r.participantName),
      escape(r.jobTitle || 'Demandeur d\'emploi'),
      escape(pnpeNumber),
      escape(r.phone),
      escape(r.email),
      escape(isVolet1),
      escape(isVolet2),
      escape(r.comments || ''),
      escape('') // Colonne vide pour la signature sur la feuille d'émargement
    ].join(';');
  });

  const csvContent = BOM + [headers.map(h => `"${h}"`).join(';'), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const slugPart = invitation ? invitation.slug : 'pnpe-demandeurs';
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `demandeurs_${slugPart}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
