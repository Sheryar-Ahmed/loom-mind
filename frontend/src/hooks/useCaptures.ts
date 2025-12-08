import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  Capture,
  CreateCaptureData,
  UpdateCaptureData,
  CaptureFilters,
  ApiResponse,
} from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/authStore';

/**
 * Capture Hooks
 */

export function useCaptures(filters?: CaptureFilters) {
  return useQuery({
    queryKey: ['captures', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(key, v.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await apiClient.get<ApiResponse<Capture[]>>(
        `/captures?${params.toString()}`
      );
      return response;
    },
  });
}

export function useCapture(id: string) {
  return useQuery({
    queryKey: ['capture', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Capture>>(`/captures/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useRecentCaptures(limit: number = 10) {
  const isAuthenticated = useAuthStore?.((state) => state.isAuthenticated) ?? false;
  
  return useQuery({
    queryKey: ['captures', 'recent', limit],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Capture[]>>(
        `/captures/recent?limit=${limit}`
      );
      return response.data;
    },
    enabled: isAuthenticated,
  });
}

export function useCreateCapture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCaptureData) => {
      if (data.file) {
        const formData = new FormData();
        formData.append('type', data.type);
        if (data.title) formData.append('title', data.title);
        if (data.url) formData.append('url', data.url);
        if (data.text) formData.append('text', data.text);
        if (data.tags) formData.append('tags', JSON.stringify(data.tags));
        if (data.collectionIds) formData.append('collectionIds', JSON.stringify(data.collectionIds));
        formData.append('file', data.file);

        const response = await apiClient.uploadFile<ApiResponse<Capture>>(
          '/captures',
          formData
        );
        return response.data;
      } else {
        const response = await apiClient.post<ApiResponse<Capture>>('/captures', data);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captures'] });
      toast({
        title: 'Capture created',
        description: 'Your capture has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create capture',
        description: error.response?.data?.error?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateCapture(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCaptureData) => {
      const response = await apiClient.put<ApiResponse<Capture>>(`/captures/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captures'] });
      queryClient.invalidateQueries({ queryKey: ['capture', id] });
      toast({
        title: 'Capture updated',
        description: 'Your changes have been saved.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.response?.data?.error?.message || 'Could not update capture',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteCapture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/captures/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captures'] });
      toast({
        title: 'Capture deleted',
        description: 'The capture has been removed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error.response?.data?.error?.message || 'Could not delete capture',
        variant: 'destructive',
      });
    },
  });
}
