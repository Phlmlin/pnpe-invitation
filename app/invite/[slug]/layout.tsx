import type { Metadata, ResolvingMetadata } from 'next';
import { headers } from 'next/headers';
import { store } from '@/lib/store';

interface InviteLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(
  props: InviteLayoutProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;

  const defaultTitle = "Activité Officielle — Pôle National de Promotion de l'Emploi (PNPE)";
  const defaultDesc = "Confirmez votre présence aux activités officielles du PNPE Gabon.";

  // Déterminer dynamiquement l'URL de base selon la requête entrante
  let baseUrl = 'https://pnpe-invitation.greenmoundounga.workers.dev';
  try {
    const headersList = await headers();
    const host =
      headersList.get('x-forwarded-host') ||
      headersList.get('host') ||
      'pnpe-invitation.greenmoundounga.workers.dev';
    const proto = headersList.get('x-forwarded-proto') || 'https';
    baseUrl = `${proto}://${host}`;
  } catch {
    // Utiliser baseUrl par défaut
  }

  const invitation = await store.getInvitationBySlug(slug);

  if (!invitation) {
    return {
      title: defaultTitle,
      description: defaultDesc,
    };
  }

  // Résumé des volets pour un aperçu riche sur WhatsApp
  const voletsSummary = invitation.volets
    .map((v) => `${v.badge} : ${v.title} (${v.date})`)
    .join(' • ');

  const description = voletsSummary
    ? `${invitation.organization} — ${voletsSummary}`
    : (invitation.introMessage || defaultDesc);

  const imageUrl = `${baseUrl}/api/invite-image/${slug}`;
  const pageUrl = `${baseUrl}/invite/${slug}`;

  return {
    title: `${invitation.title} — Activité PNPE`,
    description: description.slice(0, 200),
    openGraph: {
      title: invitation.title,
      description: description.slice(0, 200),
      url: pageUrl,
      siteName: "Pôle National de Promotion de l'Emploi - PNPE Gabon",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: invitation.title,
        },
      ],
      type: 'website',
      locale: 'fr_GA',
    },
    twitter: {
      card: 'summary_large_image',
      title: invitation.title,
      description: description.slice(0, 200),
      images: [imageUrl],
    },
    other: {
      'og:image:secure_url': imageUrl,
      'og:image:type': 'image/jpeg',
      'og:image:width': '1200',
      'og:image:height': '630',
    },
  };
}

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
