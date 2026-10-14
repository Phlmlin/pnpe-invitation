'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import InvitationStudio from '@/components/InvitationStudio';

export default function AdminNewInvitationPage() {
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <AdminLayout>
      <InvitationStudio isEditing={false} />
    </AdminLayout>
  );
}
