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

interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }

  // Handle empty responses
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    // @ts-expect-error - caller must know the type
    return undefined;
  }
  return (await res.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, init?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: any, init?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...init, method: "POST", body }),
  put: <T>(path: string, body?: any, init?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...init, method: "PUT", body }),
  patch: <T>(path: string, body?: any, init?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...init, method: "PATCH", body }),
  delete: <T>(path: string, init?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...init, method: "DELETE" }),
};

export type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};


