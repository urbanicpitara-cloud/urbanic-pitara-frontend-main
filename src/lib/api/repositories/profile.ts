import { apiClient } from "@/lib/api/client";

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export const profileRepository = {
  /** 👤 Get current logged-in user */
  async me(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>("/auth/me");
  },

  /** ✏️ Update current logged-in user */
  async update(data: Partial<User>): Promise<{ user: User }> {
    return apiClient.patch<{ user: User }>("/auth/me", data);
  },
};
