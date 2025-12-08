'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface NoteEditorProps {
  defaultValue?: string;
  onSave: (content: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function NoteEditor({ defaultValue = '', onSave, onCancel, isLoading }: NoteEditorProps) {
  const [content, setContent] = useState(defaultValue);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={isLoading || !content.trim()}>
          {isLoading ? 'Saving...' : 'Save Note'}
        </Button>
      </div>
    </div>
  );
}
