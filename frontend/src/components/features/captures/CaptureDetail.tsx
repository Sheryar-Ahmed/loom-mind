'use client';

import { X, ExternalLink, Trash2, RefreshCw, Tag as TagIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Capture } from '@/types/capture.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CaptureDetailProps {
  capture: Capture | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function CaptureDetail({ capture, open, onClose, onDelete }: CaptureDetailProps) {
  if (!capture) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{capture.title || 'Untitled'}</DialogTitle>
          <DialogDescription>
            Created {formatDate(new Date(capture.createdAt))}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Actions */}
          <div className="flex gap-2">
            {capture.type === 'url' && capture.url && (
              <Button variant="outline" size="sm" asChild>
                <a href={capture.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open URL
                </a>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  onDelete(capture.id);
                  onClose();
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>

          <Separator />

          {/* Content */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              {capture.notes && capture.notes.length > 0 && (
                <TabsTrigger value="notes">Notes ({capture.notes.length})</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              {/* Image */}
              {capture.type === 'image' && capture.imageUrl && (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={capture.imageUrl}
                    alt={capture.title || 'Image'}
                    className="w-full"
                  />
                </div>
              )}

              {/* Text Content */}
              {capture.text && (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{capture.text}</p>
                </div>
              )}

              {/* URL Metadata */}
              {capture.type === 'url' && capture.metadata && (
                <div className="space-y-3">
                  {capture.metadata.description && (
                    <p className="text-sm text-muted-foreground">
                      {capture.metadata.description}
                    </p>
                  )}
                  {capture.metadata.author && (
                    <p className="text-sm">
                      <span className="font-medium">Author:</span> {capture.metadata.author}
                    </p>
                  )}
                  {capture.metadata.publishedDate && (
                    <p className="text-sm">
                      <span className="font-medium">Published:</span>{' '}
                      {formatDate(new Date(capture.metadata.publishedDate))}
                    </p>
                  )}
                </div>
              )}

              {/* File Info */}
              {(capture.type === 'file' || capture.type === 'image') && capture.imageUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={capture.imageUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Download File
                  </a>
                </Button>
              )}
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Type</p>
                  <Badge variant="secondary">{capture.type}</Badge>
                </div>
                <div>
                  <p className="font-medium mb-1">Status</p>
                  <Badge variant={capture.processingStatus === 'completed' ? 'default' : 'secondary'}>
                    {capture.processingStatus}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium mb-1">Created</p>
                  <p className="text-muted-foreground">{formatDate(new Date(capture.createdAt))}</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Updated</p>
                  <p className="text-muted-foreground">{formatDate(new Date(capture.updatedAt))}</p>
                </div>
              </div>

              {/* Tags */}
              {capture.tags && capture.tags.length > 0 && (
                <div>
                  <p className="font-medium mb-2 text-sm flex items-center gap-2">
                    <TagIcon className="h-4 w-4" />
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {capture.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {capture.notes && capture.notes.length > 0 && (
              <TabsContent value="notes" className="space-y-4">
                {capture.notes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(new Date(note.createdAt))}
                    </p>
                  </div>
                ))}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
