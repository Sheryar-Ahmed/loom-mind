import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Capture, SearchParams, ApiResponse } from '@/types';
import { useAuthStore } from '@/store/authStore';

/**
 * Search Hooks
 */

export function useSearch(params: SearchParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery({
    queryKey: ['search', params],
    queryFn: async () => {
      const response = await apiClient.post<ApiResponse<Capture[]>>('/search', params);
      return response;
    },
    enabled: isAuthenticated && (!!params.query || !!params.types || !!params.tags),
  });
}

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: ['search', 'suggestions', query],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<string[]>>(
        `/search/suggestions?q=${encodeURIComponent(query)}`
      );
      return response.data;
    },
    enabled: query.length >= 2,
  });
}

export function usePopularTags(limit: number = 10) {
  return useQuery({
    queryKey: ['tags', 'popular', limit],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>(
        `/search/popular-tags?limit=${limit}`
      );
      return response.data;
    },
  });
}
