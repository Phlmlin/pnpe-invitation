import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return new NextResponse('Slug manquant', { status: 400 });
    }

    const invitation = await store.getInvitationBySlug(slug);

    if (invitation?.imageUrl) {
      // Cas 1 : Image encodée en data URL Base64 (upload direct depuis le formulaire admin)
      if (invitation.imageUrl.startsWith('data:image/')) {
        const matches = invitation.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];

          // Conversion universelle base64 -> Uint8Array (compatible Node.js et Cloudflare Workers)
          const binaryString = atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          return new Response(bytes, {
            status: 200,
            headers: {
              'Content-Type': mimeType,
              'Content-Length': bytes.byteLength.toString(),
              'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
            },
          });
        }
      }

      // Cas 2 : Image hébergée sur une URL HTTP / HTTPS externe
      if (
        invitation.imageUrl.startsWith('http://') ||
        invitation.imageUrl.startsWith('https://')
      ) {
        return NextResponse.redirect(invitation.imageUrl, 302);
      }
    }

    // Cas 3 : Repli sur le logo officiel PNPE
    const origin = request.nextUrl.origin;
    return NextResponse.redirect(new URL('/logo-pnpe.png', origin), 302);
  } catch (error) {
    console.error('Erreur API invite-image:', error);
    const origin = request.nextUrl.origin;
    return NextResponse.redirect(new URL('/logo-pnpe.png', origin), 302);
  }
}
