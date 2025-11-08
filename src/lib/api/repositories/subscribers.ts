import { apiClient } from "../client";
import type { Subscriber, SubscriberResponse } from "@/types/subscribers";

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  return url.replace(/\/$/, "");
};

export const subscribersRepository = {
  /** Get all subscribers with pagination */
  async getAll(page = 1, limit = 10): Promise<SubscriberResponse> {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    }).toString();
    const response = await apiClient.get<SubscriberResponse>(`/subscriptions?${params}`);
    return response;
  },

  /** Delete a subscriber */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/subscriptions/${id}`);
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
  }
};