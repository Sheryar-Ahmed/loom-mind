'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Upload, Link as LinkIcon, FileText, Image as ImageIcon } from 'lucide-react';
import { createCaptureSchema, type CreateCaptureFormData } from '@/validations/capture.schema';
import { useCreateCapture } from '@/hooks/useCaptures';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface CaptureFormProps {
  onSuccess?: () => void;
}

export function CaptureForm({ onSuccess }: CaptureFormProps) {
  const [captureType, setCaptureType] = useState<'url' | 'text' | 'image' | 'file' | 'note'>('url');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');

  const createMutation = useCreateCapture();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCaptureFormData>({
    resolver: zodResolver(createCaptureSchema),
    defaultValues: {
      type: 'url',
    },
  });

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmit = async (data: CreateCaptureFormData) => {
    // Validate based on capture type
    if (captureType === 'url' && !data.url) {
      return; // Form validation will handle this
    }
    if (captureType === 'text' && !data.text) {
      return; // Form validation will handle this
    }
    if ((captureType === 'image' || captureType === 'file') && !selectedFile) {
      setFileError(`Please select ${captureType === 'image' ? 'an image' : 'a file'}`);
      return;
    }

    setFileError(''); // Clear any previous error

    const captureData: any = {
      type: captureType,
      title: data.title || '',
      tags,
    };

    if (captureType === 'url') {
      captureData.url = data.url;
    } else if (captureType === 'text') {
      captureData.text = data.text;
    } else if ((captureType === 'image' || captureType === 'file') && selectedFile) {
      captureData.file = selectedFile;
    }

    createMutation.mutate(captureData, {
      onSuccess: () => {
        reset();
        setTags([]);
        setSelectedFile(null);
        setFileError('');
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Tabs value={captureType} onValueChange={(v) => setCaptureType(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="url">
            <LinkIcon className="h-4 w-4 mr-2" />
            URL
          </TabsTrigger>
          <TabsTrigger value="text">
            <FileText className="h-4 w-4 mr-2" />
            Text
          </TabsTrigger>
          <TabsTrigger value="image">
            <ImageIcon className="h-4 w-4 mr-2" />
            Image
          </TabsTrigger>
          <TabsTrigger value="file">
            <Upload className="h-4 w-4 mr-2" />
            File
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/article"
              {...register('url')}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Text Content</Label>
            <Textarea
              id="text"
              placeholder="Enter your text or note..."
              rows={6}
              {...register('text')}
            />
            {errors.text && (
              <p className="text-sm text-destructive">{errors.text.message}</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Image File</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] || null);
                setFileError('');
              }}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
            )}
            {fileError && captureType === 'image' && (
              <p className="text-sm text-destructive">{fileError}</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="file" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Document File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] || null);
                setFileError('');
              }}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
            )}
            {fileError && captureType === 'file' && (
              <p className="text-sm text-destructive">{fileError}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Common Fields */}
      <div className="space-y-2">
        <Label htmlFor="title">Title (Optional)</Label>
        <Input
          id="title"
          placeholder="Give your capture a title..."
          {...register('title')}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder="Add tags..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create Capture'}
      </Button>
    </form>
  );
}
