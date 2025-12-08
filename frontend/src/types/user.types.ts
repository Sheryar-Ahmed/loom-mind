/**
 * User Types
 */

export type UserPlan = 'free' | 'pro' | 'power';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  captureCount: number;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}
