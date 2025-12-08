'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearch } from '@/hooks/useSearch';
import { SearchBar } from '@/components/features/search/SearchBar';
import { SearchFilters } from '@/components/features/search/SearchFilters';
import { SearchResults } from '@/components/features/search/SearchResults';
import { Card } from '@/components/ui/card';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

  const [query, setQuery] = useState(urlQuery);
  const [types, setTypes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(urlTags);
  const [sortBy, setSortBy] = useState('relevance');

  // Update local state when URL changes
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    setTags(urlTags);
  }, [searchParams.get('tags')]);

  const { data, isLoading, pagination } = useSearch({
    query: query || undefined,
    types: types.length > 0 ? types : undefined,
    tags: tags.length > 0 ? tags : undefined,
    sortBy: sortBy as any,
  });
  
  const handleClearFilters = () => {
    setTypes([]);
    setTags([]);
    setSortBy('relevance');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Search</h1>
        <p className="text-muted-foreground">
          Find your captures across all content types
        </p>
      </div>

      <Card className="p-6">
        <SearchBar />
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <SearchFilters
            types={types}
            tags={tags}
            sortBy={sortBy}
            onTypeChange={setTypes}
            onTagRemove={(tag) => setTags(tags.filter((t) => t !== tag))}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
          />
        </div>

        <div className="lg:col-span-3">
          <SearchResults
            captures={data || []}
            isLoading={isLoading}
            totalCount={pagination?.total}
          />
        </div>
      </div>
    </div>
  );
}
