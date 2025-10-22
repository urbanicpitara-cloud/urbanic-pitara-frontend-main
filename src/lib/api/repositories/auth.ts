import { apiClient } from "@/lib/api/client";

type LoginResponse = { 
  token: string; 
  user: { 
    id: string; 
    email: string; 
    firstName?: string; 
    lastName?: string; 
  } 
};

export const authRepository = {
  async me(): Promise<{ user: LoginResponse["user"] }> {
    try {
      // Try cookie-based auth first
      return await apiClient.get<{ user: LoginResponse["user"] }>("/auth/me");
    } catch (error) {
      // Fallback to token if available
      const token = localStorage.getItem('auth_token');
      if (!token) throw error;
      
      return await apiClient.get<{ user: LoginResponse["user"] }>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", { 
      email, 
      password 
    });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  async signup(email: string, password: string, firstName?: string, lastName?: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/signup", { 
      email, 
      password, 
      firstName, 
      lastName 
    });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout", {});
    localStorage.removeItem('auth_token');
  }
};



