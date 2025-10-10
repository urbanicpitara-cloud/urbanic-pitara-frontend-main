import { apiClient } from "@/lib/api/client";

type LoginResponse = { token: string; user: { id: string; email: string; firstName?: string; lastName?: string } };

export const authRepository = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return await apiClient.post<LoginResponse>("/auth/login", { email, password });
  },
  async signup(email: string, password: string, firstName?: string, lastName?: string): Promise<LoginResponse> {
    return await apiClient.post<LoginResponse>("/auth/signup", { email, password, firstName, lastName });
  },
  async me(token: string): Promise<{ user: LoginResponse["user"] }> {
    return await apiClient.get<{ user: LoginResponse["user"] }>("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
  },
};



