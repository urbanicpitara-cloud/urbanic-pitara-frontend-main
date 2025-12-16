"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { authAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft, Loader2, Lock, CheckCircle2 } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const res = await authAPI.resetPassword({ token: token!, newPassword });
      setSuccess(true);
      setMessage(res.data.message || "Password reset successful! You can now log in.");
    } catch (err: unknown) {
      console.error(err);
      setError(true);
      setMessage("Invalid or expired reset link. Please try requesting a new one.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-green-100 text-center"
      >
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-[family-name:var(--font-cinzel)] font-bold text-gray-900 mb-4">
          Password Reset!
        </h2>
        <p className="text-gray-500 mb-8">
          Your password has been successfully updated. You can now use your new password to log in.
        </p>
        <Link
          href="/auth"
          className="block w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg"
        >
          Proceed to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Lock className="w-8 h-8 text-[var(--gold)]" />
          </motion.div>

          <h1 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-500 font-[family-name:var(--font-geist-sans)]">
            Create a new strong password for your account.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 ml-1">
              New Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 px-4 bg-gray-50 border-gray-200 focus:border-black focus:ring-black transition-all rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !token}
            className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>

          {!token && (
            <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-100 rounded-xl text-sm font-medium text-center">
              Invalid or missing reset token. Please request a new link.
            </div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-sm font-medium text-center ${error
                ? "bg-red-50 text-red-600 border border-red-100"
                : "bg-blue-50 text-blue-700 border border-blue-100"
                }`}
            >
              {message}
            </motion.div>
          )}
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/auth"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50/50">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[var(--gold)] animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Loading secure interface...</p>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
