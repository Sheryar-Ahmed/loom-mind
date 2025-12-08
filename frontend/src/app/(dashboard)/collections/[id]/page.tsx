'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCollectionById, removeCapturesFromCollection } from '@/lib/api/collections';
import { CaptureCard } from '@/components/features/captures/CaptureCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Globe, Lock, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Capture } from '@/types/capture.types';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const collectionId = params.id as string;

  const [captureToRemove, setCaptureToRemove] = useState<string | null>(null);

  const { data: collection, isLoading } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => getCollectionById(collectionId),
    enabled: !!collectionId,
  });

  const removeMutation = useMutation({
    mutationFn: (captureId: string) =>
      removeCapturesFromCollection(collectionId, { captureIds: [captureId] }),
    onSuccess: () => {
      toast.success('Capture removed from collection');
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setCaptureToRemove(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Failed to remove capture');
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-96 mb-2" />
          <Skeleton className="h-6 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Collection not found</h2>
          <p className="text-muted-foreground mb-4">
            This collection doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push('/collections')}>Back to Collections</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => router.push('/collections')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Collections
        </Button>

        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
              {collection.description && (
                <p className="text-muted-foreground mt-2">{collection.description}</p>
              )}
            </div>
            <Badge variant={collection.isPublic ? 'default' : 'secondary'}>
              {collection.isPublic ? (
                <>
                  <Globe className="mr-1 h-3 w-3" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="mr-1 h-3 w-3" />
                  Private
                </>
              )}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {collection.captures?.length || 0} captures
          </p>
        </div>

        {collection.captures && collection.captures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collection.captures.map((capture: Capture) => (
              <div key={capture.id} className="relative group">
                <CaptureCard capture={capture} />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setCaptureToRemove(capture.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              No captures in this collection yet. Add some captures to get started!
            </p>
          </div>
        )}

        <AlertDialog open={!!captureToRemove} onOpenChange={(open: boolean) => !open && setCaptureToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from collection?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the capture from this collection. The capture itself won't be
                deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => captureToRemove && removeMutation.mutate(captureToRemove)}
                disabled={removeMutation.isPending}
              >
                {removeMutation.isPending ? 'Removing...' : 'Remove'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
