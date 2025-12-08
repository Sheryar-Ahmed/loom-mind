import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { AuthResponse, LoginCredentials, SignupData, User } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

/**
 * Auth Hooks
 */

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
        '/auth/login',
        credentials
      );
      return response; // Returns { success, data: { user, accessToken } }
    },
    onSuccess: (response) => {
      setAuth(response.data.user, response.data.accessToken);
      toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
      router.push('/');
    },
    onError: (error: any) => {
      toast({
        title: 'Login failed',
        description: error.response?.data?.error?.message || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });
}

export function useSignup() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
        '/auth/signup',
        data
      );
      return response; // Returns { success, data: { user, accessToken } }
    },
    onSuccess: (response) => {
      setAuth(response.data.user, response.data.accessToken);
      toast({ title: 'Account created!', description: 'Welcome to MemoryLayer.' });
      router.push('/');
    },
    onError: (error: any) => {
      toast({
        title: 'Signup failed',
        description: error.response?.data?.error?.message || 'Could not create account',
        variant: 'destructive',
      });
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      router.push('/login');
      toast({ title: 'Logged out', description: 'You have been logged out successfully.' });
    },
  });
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
      // apiClient.get returns the full response body: { success, data: user }
      return response.data;
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: false, // Don't retry on auth failures
  });
}

export function useUpdateProfile() {
  const updateUser = useAuthStore((state) => state.updateUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const response = await apiClient.put<{ success: boolean; data: User }>(
        '/auth/me',
        data
      );
      return response.data;
    },
    onSuccess: (user) => {
      updateUser(user);
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      toast({ 
        title: 'Profile updated', 
        description: 'Your profile has been updated successfully.' 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.response?.data?.error?.message || 'Could not update profile',
        variant: 'destructive',
      });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      await apiClient.post('/auth/change-password', data);
    },
    onSuccess: () => {
      toast({ 
        title: 'Password changed', 
        description: 'Your password has been changed successfully.' 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Change failed',
        description: error.response?.data?.error?.message || 'Could not change password',
        variant: 'destructive',
      });
    },
  });
}
