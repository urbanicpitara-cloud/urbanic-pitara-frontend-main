import { apiClient } from "../client";
import type { Subscriber, SubscriberResponse } from "@/types/subscribers";

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  return url.replace(/\/$/, "");
};

export const subscribersRepository = {
  /** Get all subscribers with pagination and optional filter */
  async getAll(page = 1, limit = 10, verified?: boolean): Promise<SubscriberResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (verified !== undefined) {
      params.append('verified', verified.toString());
    }
    const response = await apiClient.get<SubscriberResponse>(`/subscriptions?${params.toString()}`);
    return response;
  },

  /** Delete a subscriber */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/subscriptions/${id}`);
  },

  async deleteMany(ids: string[]): Promise<void> {
    await apiClient.delete("/subscriptions", { ids });
  },

  /** Export subscribers list */
  async export(): Promise<Blob> {
    const response = await fetch(`${getBaseUrl()}/subscriptions/export`, {
      headers: {
        Accept: "application/octet-stream",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`
      }
    });
    if (!response.ok) {
      throw new Error("Failed to export subscribers");
    }
    return response.blob();
  },

  /** Toggle subscriber verification status */
  async toggleVerification(id: string): Promise<Subscriber> {
    const response = await apiClient.patch<Subscriber>(
      `/subscriptions/${id}/verify`,
      {}
    );
    return response;
  },

  /** Send bulk email to subscribers */
  async sendEmail(data: { ids?: string[], subject: string, message: string, isHtml: boolean, selectAll?: boolean, filterVerified?: string }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>("/subscriptions/admin/email", data);
    return response;
  }
};