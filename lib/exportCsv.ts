import { RSVPRegistration, Invitation } from './types';

export function exportRSVPsToCSV(
  rsvps: RSVPRegistration[],
  invitation?: Invitation | null,
  allRsvps?: RSVPRegistration[]
): void {
  // BOM UTF-8 pour forcer Excel à afficher correctement les caractères accentués en français
  const BOM = '\uFEFF';

  // Tri garanti par ordre chronologique croissant (du plus ancien au plus récent : PNPE-AROM-0001 en 1ère ligne)
  const sorted = [...rsvps].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Table de correspondance pour le matricule séquentiel global (PNPE-AROM-XXXX)
  const refList =
    allRsvps && allRsvps.length > 0
      ? [...allRsvps].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      : sorted;
  const seqMap = new Map(refList.map((r, idx) => [r.id, idx + 1]));

  const getActivityTitle = (r: RSVPRegistration, inv?: Invitation | null): string => {
    if (!inv || !inv.volets || inv.volets.length === 0) {
      return 'Activité en cours';
    }
    if (inv.volets.length === 1) {
      return inv.volets[0].title || inv.title || 'Activité 1';
    }
    const names: string[] = [];
    if (r.volets?.includes('volet-1') && inv.volets[0]) {
      names.push(inv.volets[0].title || 'Activité 1');
    }
    if (r.volets?.includes('volet-2') && inv.volets[1]) {
      names.push(inv.volets[1].title || 'Activité 2');
    }
    return names.length > 0 ? names.join(' + ') : (inv.volets[0].title || 'Activité');
  };

  const getPnpeNumber = (r: RSVPRegistration): string => {
    if (r.comments?.includes('Numéro PNPE :')) {
      return r.comments.replace('Numéro PNPE :', '').trim();
    }
    if (r.company?.includes('N° PNPE:')) {
      return r.company.split('N° PNPE:')[1]?.replace(')', '').trim();
    }
    return '-';
  };

  // Les 7 colonnes réelles demandées
  const headers = [
    "Matricule",
    "Demandeur d'emploi",
    "Profil",
    "Contact",
    "Activité choisie",
    "N° PNPE",
    "Date et Heure d'inscription"
  ];

  const escape = (val: string | number | undefined) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = sorted.map((r) => {
    const seq = seqMap.get(r.id) || 1;
    const matricule = `PNPE-AROM-${String(seq).padStart(4, '0')}`;
    const participantName = r.participantName || 'Non renseigné';
    const profil = r.jobTitle || 'Demandeur d\'emploi';
    const contact = r.phone && r.phone !== 'Non renseigné' ? r.phone : 'Non renseigné';
    const activite = getActivityTitle(r, invitation);
    const pnpe = getPnpeNumber(r) || '-';

    const d = new Date(r.createdAt);
    let dateFormatted = '-';
    if (!isNaN(d.getTime())) {
      const datePart = d.toLocaleDateString('fr-FR', {
        timeZone: 'Africa/Libreville',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timePart = d.toLocaleTimeString('fr-FR', {
        timeZone: 'Africa/Libreville',
        hour: '2-digit',
        minute: '2-digit'
      });
      dateFormatted = `${datePart} à ${timePart}`;
    }

    return [
      escape(matricule),
      escape(participantName),
      escape(profil),
      escape(contact),
      escape(activite),
      escape(pnpe),
      escape(dateFormatted)
    ].join(';');
  });

  const csvContent = BOM + [headers.map((h) => `"${h}"`).join(';'), ...rows].join('\r\n');

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
