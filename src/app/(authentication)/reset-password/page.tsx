"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { authAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.resetPassword({ token: token!, newPassword });
      setMessage(res.data.message || "Password reset successful! You can now log in.");
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Invalid or expired reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      <form onSubmit={handleReset} className="space-y-4">
        <Input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading || !token}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
        {message && <p className="text-sm mt-3">{message}</p>}
      </form>
    </div>
  );
}
