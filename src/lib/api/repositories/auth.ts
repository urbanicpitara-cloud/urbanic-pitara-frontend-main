import { apiClient } from "@/lib/api/client";
import type { User, AuthResponse } from "@/types/auth";

interface ApiErrorResponse {
  message?: string;
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
  };
}

/**
 * Repository layer for authentication-related API calls
 */
export const authRepository = {
  /** 👤 Get current logged-in user */
  async me(): Promise<User> {
    try {
      const user = await apiClient.get<User>("/auth/me");
      return user;
    } catch (err) {
      const error = err as ApiErrorResponse;
      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to get user profile"
      );
    }
  },

  /** 🔑 Log in a user */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      if (response.token) {
        localStorage.setItem("auth_token", response.token);
      }

      return response;
    } catch (err) {
      const error = err as ApiErrorResponse;
      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Login failed"
      );
    }
  },

  /** 🧾 Register / Sign up a new user */
  async signup(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/signup", {
        email,
        password,
        firstName,
        lastName,
      });

      if (response.token) {
        localStorage.setItem("auth_token", response.token);
      }

      return response;
    } catch (err) {
      const error = err as ApiErrorResponse;
      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to create account"
      );
    }
  },

  /** 🚪 Log out the current user */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout", {});
    } finally {
      localStorage.removeItem("auth_token");
    }
  },
};
