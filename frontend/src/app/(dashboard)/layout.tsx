'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCurrentUser } from '@/hooks/useAuth';
import { useHydration } from '@/hooks/useHydration';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CaptureForm } from '@/components/features/captures/CaptureForm';
import { useUIStore } from '@/store/uiStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user: storeUser, updateUser } = useAuthStore();
  const { data: user, isLoading, error } = useCurrentUser();
  const { dialogOpen, dialogType, closeDialog } = useUIStore();
  const hydrated = useHydration();

  useEffect(() => {
    // Only redirect after hydration is complete
    if (hydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    if (user && !error) {
      updateUser(user);
    }
  }, [user, error, updateUser]);

  // Show loading while hydrating from localStorage
  if (!hydrated) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Capture Dialog */}
      <Dialog open={dialogOpen && dialogType === 'capture'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Capture</DialogTitle>
          </DialogHeader>
          <CaptureForm onSuccess={closeDialog} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
