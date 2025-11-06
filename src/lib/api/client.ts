/* eslint-disable @typescript-eslint/no-explicit-any */

// Lightweight REST client with base URL and JSON handling

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  try {
    // Validate URL
    new URL(url);
    return url.replace(/\/$/, ""); // Remove trailing slash
  } catch {
    throw new Error("Invalid API URL");
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
    // Get token from localStorage if available
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      credentials: "include", // optional, only needed if backend uses cookies
      headers,
    });

    if (!response.ok) {
      // Try to parse JSON error, fallback to status text
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || response.statusText || "Request failed");
    }

    // Return parsed JSON
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

  put<T>(url: string, body: any, options: RequestOptions = {}) {
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  patch<T>(url: string, body: any, options: RequestOptions = {}) {
    return this.request<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete<T>(url: string, options: RequestOptions = {}) {
    return this.request<T>(url, {
      ...options,
      method: "DELETE",
    });
  },
};

// Optional type for pagination info
export type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};
