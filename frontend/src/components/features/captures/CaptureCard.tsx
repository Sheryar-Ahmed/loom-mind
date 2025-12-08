'use client';

import { Link as LinkIcon, FileText, Image as ImageIcon, File, ExternalLink, Trash2, Edit, FolderPlus } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { Capture } from '@/types/capture.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AddToCollectionDialog } from '../collections/AddToCollectionDialog';

interface CaptureCardProps {
  capture: Capture;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onClick?: () => void;
}

const typeIcons = {
  url: LinkIcon,
  text: FileText,
  image: ImageIcon,
  file: File,
  note: FileText,
};

const typeColors = {
  url: 'text-blue-500',
  text: 'text-green-500',
  image: 'text-purple-500',
  file: 'text-orange-500',
  note: 'text-pink-500',
};

export function CaptureCard({ capture, onDelete, onEdit, onClick }: CaptureCardProps) {
  const TypeIcon = typeIcons[capture.type];
  const [showAddToCollection, setShowAddToCollection] = useState(false);

  return (
    <>
      <AddToCollectionDialog
        open={showAddToCollection}
        onOpenChange={setShowAddToCollection}
        captureIds={[capture.id]}
      />
    <Card className="group hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <TypeIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${typeColors[capture.type]}`} />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2">
                {capture.title || 'Untitled'}
              </CardTitle>
              <CardDescription className="mt-1">
                {formatRelativeTime(new Date(capture.createdAt))}
              </CardDescription>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddToCollection(true);
              }}
              title="Add to Collection"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(capture.id);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(capture.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Preview */}
        {capture.type === 'url' && capture.metadata?.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {capture.metadata.description}
          </p>
        )}
        {capture.type === 'text' && capture.text && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {capture.text}
          </p>
        )}
        {capture.type === 'image' && capture.imageUrl && (
          <div className="mb-3 rounded-md overflow-hidden">
            <img
              src={capture.thumbnailUrl || capture.imageUrl}
              alt={capture.title || 'Image'}
              className="w-full h-40 object-cover"
            />
          </div>
        )}

        {/* Tags */}
        {capture.tags && capture.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {capture.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {capture.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{capture.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* URL Link */}
        {capture.type === 'url' && capture.url && (
          <a
            href={capture.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
            Visit URL
          </a>
        )}
      </CardContent>
    </Card>
    </>
  );
}
