import { Invitation } from './types';

export function generateHtmlEmail(invitation: Invitation, baseUrl: string): string {
  const inviteUrl = `${baseUrl.replace(/\/$/, '')}/invite/${invitation.slug}`;

  const voletsHtml = invitation.volets
    .map((v) => {
      const isBlue = v.theme === 'blue';
      const borderColor = isBlue ? '#1E3A8A' : '#065F46';
      const bgColor = isBlue ? '#F0F4FF' : '#ECFDF5';
      const badgeBg = isBlue ? '#1E3A8A' : '#065F46';
      const badgeColor = '#FFFFFF';
      const dateColor = isBlue ? '#1E3A8A' : '#065F46';

      const statusBadge =
        v.locationStatus === 'negotiation'
          ? `<span style="display:inline-block; margin-left:8px; padding:2px 8px; font-size:11px; font-weight:700; color:#B45309; background-color:#FFFBEB; border:1px solid #FDE68A; border-radius:3px; text-transform:uppercase;">Négociation en cours</span>`
          : `<span style="display:inline-block; margin-left:8px; padding:2px 8px; font-size:11px; font-weight:700; color:#065F46; background-color:#ECFDF5; border:1px solid #A7F3D0; border-radius:3px; text-transform:uppercase;">Confirmé</span>`;

      return `
        <!-- Volet Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px; background-color:${bgColor}; border:1px solid ${borderColor}; border-radius:4px; border-collapse:separate;">
          <tr>
            <td style="padding:20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:inline-block; padding:4px 10px; font-family:'Courier New', Courier, monospace; font-size:12px; font-weight:bold; letter-spacing:1px; color:${badgeColor}; background-color:${badgeBg}; border-radius:2px;">
                      ${v.badge.toUpperCase()}
                    </span>
                    <span style="margin-left:10px; font-family:'Courier New', Courier, monospace; font-size:13px; font-weight:bold; color:${dateColor};">
                      ${v.date.toUpperCase()} • ${v.time.toUpperCase()}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <h3 style="margin:0 0 8px 0; font-family:Georgia, 'Times New Roman', serif; font-size:18px; line-height:24px; color:#0A192F;">
                      ${v.title}
                    </h3>
                    ${
                      v.description
                        ? `<p style="margin:0 0 12px 0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:13px; line-height:19px; color:#475569;">
                            ${v.description}
                          </p>`
                        : ''
                    }
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:8px; border-top:1px solid rgba(0,0,0,0.06); font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:12px; color:#334155;">
                    <strong>Lieu :</strong> ${v.location} ${statusBadge}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${invitation.title}</title>
</head>
<body style="margin:0; padding:0; background-color:#FAF9F6; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
  <!-- Ruban protocolaire Gabon (3px) -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;">
    <tr>
      <td width="33.33%" height="3" style="background-color:#009E60; line-height:3px; font-size:0;">&nbsp;</td>
      <td width="33.33%" height="3" style="background-color:#FCD116; line-height:3px; font-size:0;">&nbsp;</td>
      <td width="33.34%" height="3" style="background-color:#3A75C4; line-height:3px; font-size:0;">&nbsp;</td>
    </tr>
  </table>

  <!-- Wrapper Principal -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF9F6; padding:30px 10px;">
    <tr>
      <td align="center">
        <!-- Conteneur Carte Électronique -->
        <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px; width:100%; background-color:#FFFFFF; border:1px solid #E2E8F0; border-radius:6px; overflow:hidden;">
          
          <!-- Corps du message -->
          <tr>
            <td style="padding:32px 32px 28px 32px;">
              <p style="margin:0 0 6px 0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size:11px; font-weight:bold; letter-spacing:2px; color:#64748B; text-transform:uppercase;">
                ${invitation.organization}
              </p>

              <h1 style="margin:0 0 16px 0; font-family:Georgia, 'Times New Roman', serif; font-size:24px; line-height:32px; font-weight:normal; color:#0A192F;">
                ${invitation.title}
              </h1>

              <p style="margin:0 0 24px 0; font-size:14px; line-height:22px; color:#334155; white-space:pre-line;">
                ${invitation.introMessage}
              </p>

              <!-- Blocs Volet 1 et Volet 2 -->
              ${voletsHtml}

              <!-- Bouton d'action RSVP (Centré) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px; margin-bottom:8px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="border-radius:4px; background-color:#0A192F;">
                          <a href="${inviteUrl}" target="_blank" style="display:inline-block; padding:16px 36px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size:14px; font-weight:bold; letter-spacing:1px; color:#FFFFFF; text-decoration:none; text-transform:uppercase;">
                            CONFIRMER MA PARTICIPATION (RSVP) &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:12px;">
                    <span style="font-family:'Courier New', monospace; font-size:11px; color:#64748B;">
                      Lien direct : <a href="${inviteUrl}" style="color:#1E3A8A; text-decoration:underline;">${inviteUrl}</a>
                    </span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateWhatsAppMessage(invitation: Invitation, baseUrl: string): string {
  const inviteUrl = `${baseUrl.replace(/\/$/, '')}/invite/${invitation.slug}`;

  let text = `🏛️ *${invitation.organization.toUpperCase()}*\n`;
  text += `*${invitation.title.toUpperCase()}*\n\n`;
  text += `Madame, Monsieur le Chef d'Entreprise / DRH,\n\n`;
  text += `${invitation.introMessage}\n\n`;
  text += `📌 *PROGRAMME DES DEUX VOLETS :*\n\n`;

  invitation.volets.forEach((v) => {
    const isNegotiation = v.locationStatus === 'negotiation' ? ' _(Négociation en cours)_' : '';
    text += `🔹 *${v.badge.toUpperCase()} : ${v.title}*\n`;
    text += `📅 Date : ${v.date}\n`;
    text += `⏰ Heure : ${v.time}\n`;
    text += `📍 Lieu : ${v.location}${isNegotiation}\n\n`;
  });

  text += `✍️ *CONFIRMATION DE PRÉSENCE (RSVP EN LIGNE) :*\n`;
  text += `Veuillez sélectionner vos volets et enregistrer votre délégation sur le portail officiel :\n`;
  text += `👉 ${inviteUrl}\n\n`;
  text += `_Direction Générale du PNPE - République Gabonaise_`;

  return text;
}
