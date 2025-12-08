/**
 * Collections API Service
 * Handles all API calls related to collections
 */

import { apiClient } from '../api';
import {
  Collection,
  CollectionWithCaptures,
  CreateCollectionDto,
  UpdateCollectionDto,
  AddCapturesToCollectionDto,
  RemovecapturesFromCollectionDto,
  CollectionQueryOptions,
  CollectionResponse,
  CollectionListResponse,
  CollectionWithCapturesResponse,
} from '@/types/collection.types';

/**
 * Create a new collection
 */
export const createCollection = async (data: CreateCollectionDto): Promise<Collection> => {
  const response = await apiClient.post<CollectionResponse>('/collections', data);
  return response.data;
};

/**
 * Get user's collections with pagination and search
 */
export const getUserCollections = async (
  options: CollectionQueryOptions = {}
): Promise<{ collections: Collection[]; pagination: any }> => {
  const params = new URLSearchParams();
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.search) params.append('search', options.search);

  const response = await apiClient.get<CollectionListResponse>(
    `/collections?${params.toString()}`
  );
  return {
    collections: response.data,
    pagination: response.pagination,
  };
};

/**
 * Get public collections (for discovery)
 */
export const getPublicCollections = async (
  options: CollectionQueryOptions = {}
): Promise<{ collections: Collection[]; pagination: any }> => {
  const params = new URLSearchParams();
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.search) params.append('search', options.search);

  const response = await apiClient.get<CollectionListResponse>(
    `/collections/public?${params.toString()}`
  );
  return {
    collections: response.data,
    pagination: response.pagination,
  };
};

/**
 * Get single collection by ID (with captures)
 */
export const getCollectionById = async (id: string): Promise<CollectionWithCaptures> => {
  const response = await apiClient.get<CollectionWithCapturesResponse>(`/collections/${id}`);
  return response.data;
};

/**
 * Update collection
 */
export const updateCollection = async (
  id: string,
  data: UpdateCollectionDto
): Promise<Collection> => {
  const response = await apiClient.put<CollectionResponse>(`/collections/${id}`, data);
  return response.data;
};

/**
 * Delete collection
 */
export const deleteCollection = async (id: string): Promise<void> => {
  await apiClient.delete(`/collections/${id}`);
};

/**
 * Add captures to collection
 */
export const addCapturesToCollection = async (
  id: string,
  data: AddCapturesToCollectionDto
): Promise<Collection> => {
  const response = await apiClient.post<CollectionResponse>(`/collections/${id}/captures`, data);
  return response.data;
};

/**
 * Remove captures from collection
 */
export const removeCapturesFromCollection = async (
  id: string,
  data: RemovecapturesFromCollectionDto
): Promise<Collection> => {
  const response = await apiClient.delete<CollectionResponse>(`/collections/${id}/captures`, {
    data,
  });
  return response.data;
};
