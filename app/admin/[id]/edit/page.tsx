'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { store } from '@/lib/store';
import { Invitation } from '@/lib/types';
import AdminLayout from '@/components/AdminLayout';
import InvitationStudio from '@/components/InvitationStudio';
import { Loader2 } from 'lucide-react';

interface AdminEditInvitationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminEditInvitationPage({ params }: AdminEditInvitationPageProps) {
  const resolvedParams = use(params);
  const invitationId = resolvedParams.id;
  const router = useRouter();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    async function loadInvitation() {
      let inv = await store.getInvitationById(invitationId);
      if (!inv) {
        inv = await store.getInvitationBySlug(invitationId);
      }
      setInvitation(inv);
      setLoading(false);
    }

    loadInvitation();
  }, [invitationId, router]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!invitation) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <p className="text-slate-600 font-semibold">Invitation introuvable.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentInvitationSlug={invitation.slug} currentInvitationId={invitation.id}>
      <InvitationStudio initialInvitation={invitation} isEditing={true} />
    </AdminLayout>
  );
}
