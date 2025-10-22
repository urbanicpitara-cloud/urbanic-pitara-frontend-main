/* eslint-disable @typescript-eslint/no-explicit-any */

// Lightweight REST client with base URL and JSON handling

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }
  try {
    // Validate URL
    new URL(url);
    return url.replace(/\/$/, "");
  } catch {
    throw new Error("Invalid NEXT_PUBLIC_API_BASE_URL");
  }
};

const baseUrl = getBaseUrl();

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface BaseRequestOptions extends Omit<RequestInit, "body" | "method"> {
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

export interface RequestOptions extends BaseRequestOptions {
  method?: HttpMethod;
  body?: string;
}

export const apiClient = {
  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      credentials: "include", // Always include credentials
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  },

  get<T>(url: string, options: RequestOptions = {}) {
    return this.request<T>(url, { ...options, method: "GET" });
  },

  post<T>(url: string, body: any, options: RequestOptions = {}) {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

export type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};


