export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: any;
  token?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  error: string | null;
}
