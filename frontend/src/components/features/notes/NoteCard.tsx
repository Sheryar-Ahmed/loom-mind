'use client';

import { FileText } from 'lucide-react';
import { Note } from '@/types/capture.types';
import { Card, CardContent } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm line-clamp-3 mb-2">{note.text}</p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(note.createdAt))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
