import { z } from 'zod';

/**
 * Capture Validation Schemas
 */

export const createCaptureSchema = z.object({
  type: z.enum(['url', 'text', 'image', 'file', 'note']),
  title: z.string().max(500, 'Title is too long').optional().or(z.literal('')),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  text: z.string().max(50000, 'Text is too long').optional().or(z.literal('')),
  tags: z.array(z.string().min(1).max(50)).optional(),
  collectionIds: z.array(z.string().uuid()).optional(),
  file: z.any().optional(),
}).passthrough();

export const updateCaptureSchema = z.object({
  title: z.string().max(500, 'Title is too long').optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
});

export const createNoteSchema = z.object({
  text: z.string().min(1, 'Note text is required').max(10000, 'Note is too long'),
});

export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  isPublic: z.boolean().default(false),
});

export type CreateCaptureFormData = z.infer<typeof createCaptureSchema>;
export type UpdateCaptureFormData = z.infer<typeof updateCaptureSchema>;
export type CreateNoteFormData = z.infer<typeof createNoteSchema>;
export type CreateCollectionFormData = z.infer<typeof createCollectionSchema>;
