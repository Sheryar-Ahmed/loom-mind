'use client';

import { useState } from 'react';
import { Capture } from '@/types/capture.types';
import { CaptureCard } from '../captures/CaptureCard';
import { CaptureDetail } from '../captures/CaptureDetail';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Search } from 'lucide-react';
import { useDeleteCapture } from '@/hooks/useCaptures';

interface SearchResultsProps {
  captures: Capture[];
  isLoading: boolean;
  totalCount?: number;
}

export function SearchResults({ captures, isLoading, totalCount }: SearchResultsProps) {
  const [selectedCapture, setSelectedCapture] = useState<Capture | null>(null);
  const deleteMutation = useDeleteCapture();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (captures.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No captures found"
        description="Try adjusting your search query or filters"
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Found {totalCount || captures.length} result{captures.length !== 1 ? 's' : ''}
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {captures.map((capture) => (
            <CaptureCard
              key={capture.id}
              capture={capture}
              onClick={() => setSelectedCapture(capture)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      </div>

      <CaptureDetail
        capture={selectedCapture}
        open={!!selectedCapture}
        onClose={() => setSelectedCapture(null)}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </>
  );
}
