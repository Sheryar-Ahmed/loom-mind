/**
 * Collection Type Definitions
 * TypeScript interfaces for Collection feature
 */

import { Capture } from './capture.types';

/**
 * Collection entity
 */
export interface Collection {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  captureCount?: number;
}

/**
 * Collection with full captures
 */
export interface CollectionWithCaptures extends Collection {
  captures: Capture[];
}

/**
 * DTO for creating a new collection
 */
export interface CreateCollectionDto {
  name: string;
  description?: string;
  isPublic?: boolean;
}

/**
 * DTO for updating a collection
 */
export interface UpdateCollectionDto {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

/**
 * DTO for adding captures to collection
 */
export interface AddCapturesToCollectionDto {
  captureIds: string[];
}

/**
 * DTO for removing captures from collection
 */
export interface RemovecapturesFromCollectionDto {
  captureIds: string[];
}

/**
 * Query options for listing collections
 */
export interface CollectionQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * API Response wrapper for collections
 */
export interface CollectionResponse {
  success: boolean;
  data: Collection;
  message?: string;
}

/**
 * API Response wrapper for collection list
 */
export interface CollectionListResponse {
  success: boolean;
  data: Collection[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

/**
 * API Response wrapper for collection with captures
 */
export interface CollectionWithCapturesResponse {
  success: boolean;
  data: CollectionWithCaptures;
  message?: string;
}
