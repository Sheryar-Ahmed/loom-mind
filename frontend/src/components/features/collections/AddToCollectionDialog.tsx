'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getUserCollections, addCapturesToCollection } from '@/lib/api/collections';
import { Collection } from '@/types/collection.types';
import { toast } from 'sonner';
import { FolderPlus, Loader2 } from 'lucide-react';

interface AddToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  captureIds: string[];
}

export function AddToCollectionDialog({
  open,
  onOpenChange,
  captureIds,
}: AddToCollectionDialogProps) {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch user's collections
  const { data, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => getUserCollections({ limit: 100 }),
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      return addCapturesToCollection(collectionId, { captureIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['captures'] });
    },
  });

  const handleSubmit = async () => {
    if (selectedCollections.length === 0) {
      toast.error('Please select at least one collection');
      return;
    }

    try {
      await Promise.all(
        selectedCollections.map((collectionId) => addMutation.mutateAsync(collectionId))
      );
      toast.success(
        `Added ${captureIds.length} capture(s) to ${selectedCollections.length} collection(s)`
      );
      onOpenChange(false);
      setSelectedCollections([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to add to collections');
    }
  };

  const toggleCollection = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
          <DialogDescription>
            Select the collections you want to add {captureIds.length} capture(s) to.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data?.collections && data.collections.length > 0 ? (
            <div className="space-y-3">
              {data.collections.map((collection: Collection) => (
                <div
                  key={collection.id}
                  className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent cursor-pointer"
                  onClick={() => toggleCollection(collection.id)}
                >
                  <Checkbox
                    id={collection.id}
                    checked={selectedCollections.includes(collection.id)}
                    onCheckedChange={() => toggleCollection(collection.id)}
                  />
                  <Label
                    htmlFor={collection.id}
                    className="flex-1 cursor-pointer text-sm font-medium"
                  >
                    {collection.name}
                    <p className="text-xs text-muted-foreground font-normal">
                      {collection.captureCount || 0} captures
                    </p>
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <FolderPlus className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No collections yet. Create one first!
              </p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={addMutation.isPending || selectedCollections.length === 0}
          >
            {addMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add to Collections'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
