import { apiClient } from "@/lib/api/client";

export type User = { id: string; email: string; firstName?: string; lastName?: string };

export const profileRepository = {
  async me(token: string): Promise<{ user: User }> {
    return await apiClient.get<{ user: User }>("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
  },
  async update(token: string, data: Partial<User>): Promise<{ user: User }> {
    return await apiClient.patch<{ user: User }>("/auth/me", data, { headers: { Authorization: `Bearer ${token}` } });
  },
};


