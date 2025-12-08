'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserCollections } from '@/lib/api/collections';
import { Collection } from '@/types/collection.types';
import { CollectionCard } from './CollectionCard';
import { CreateCollectionDialog } from './CreateCollectionDialog';
import { EditCollectionDialog } from './EditCollectionDialog';
import { DeleteCollectionDialog } from './DeleteCollectionDialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

export function CollectionList() {
  const [search, setSearch] = useState('');
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);
  const debouncedSearch = useDebouncedValue(search, 500);

  const { data, isLoading } = useQuery({
    queryKey: ['collections', debouncedSearch],
    queryFn: () => getUserCollections({ search: debouncedSearch, limit: 50 }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <CreateCollectionDialog />
      </div>

      <Tabs defaultValue="my-collections" className="w-full">
        <TabsList>
          <TabsTrigger value="my-collections">My Collections</TabsTrigger>
        </TabsList>
        <TabsContent value="my-collections" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : data?.collections && data.collections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.collections.map((collection: Collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onEdit={setEditingCollection}
                  onDelete={setDeletingCollection}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {search
                  ? 'No collections found matching your search.'
                  : 'No collections yet. Create your first collection!'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {editingCollection && (
        <EditCollectionDialog
          collection={editingCollection}
          open={!!editingCollection}
          onOpenChange={(open: boolean) => !open && setEditingCollection(null)}
        />
      )}

      {deletingCollection && (
        <DeleteCollectionDialog
          collection={deletingCollection}
          open={!!deletingCollection}
          onOpenChange={(open: boolean) => !open && setDeletingCollection(null)}
        />
      )}
    </div>
  );
}
