'use client';

import { Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SearchFiltersProps {
  types: string[];
  tags: string[];
  sortBy: string;
  onTypeChange: (types: string[]) => void;
  onTagRemove: (tag: string) => void;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
}

const captureTypes = [
  { value: 'url', label: 'URL' },
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'file', label: 'File' },
  { value: 'note', label: 'Note' },
];

export function SearchFilters({
  types,
  tags,
  sortBy,
  onTypeChange,
  onTagRemove,
  onSortChange,
  onClearFilters,
}: SearchFiltersProps) {
  const handleTypeToggle = (type: string) => {
    if (types.includes(type)) {
      onTypeChange(types.filter((t) => t !== type));
    } else {
      onTypeChange([...types, type]);
    }
  };

  const hasActiveFilters = types.length > 0 || tags.length > 0 || sortBy !== 'relevance';

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Type Filters */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Type</Label>
        <div className="flex flex-wrap gap-2">
          {captureTypes.map((type) => (
            <Badge
              key={type.value}
              variant={types.includes(type.value) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleTypeToggle(type.value)}
            >
              {type.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Tags */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => onTagRemove(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Sort */}
      <div className="space-y-2">
        <Label htmlFor="sort" className="text-sm font-medium">
          Sort by
        </Label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger id="sort">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="createdAt">Date Created</SelectItem>
            <SelectItem value="updatedAt">Date Updated</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
