"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers";
import { authRepository } from "@/lib/api/repositories/auth";
import Logo from "@/components/view/Logo";
import SignUp from "@/components/view/Auth/Signup";
import Login from "@/components/view/Auth/Login";

const Auth = () => {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleLogin = async (data: any) => {
    try {
      const response = await authRepository.login(data.email, data.password);
      if (response?.user) {
        setUser(response.user); // Update auth context before redirect
        router.push("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const handleSignup = async (data: any) => {
    try {
      const response = await authRepository.signup(
        data.email,
        data.password,
        data.firstName,
        data.lastName
      );
      if (response?.user) {
        setUser(response.user); // Update auth context before redirect
        router.push("/");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f9f6f1] via-[#f3eee7] to-[#e8dfd1] px-4 py-12">
      <div className="w-full max-w-3xl mx-auto rounded-3xl bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 flex flex-col md:flex-row items-center overflow-hidden transition-all duration-500">
        {/* Left Brand Panel */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-[#c4a676] text-white p-10">
          <Logo />
          <p className="text-center text-sm mt-6 leading-relaxed text-white/90 max-w-xs">
            Discover timeless pieces and elegant fashion that speak to your individuality.
          </p>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center items-center bg-white/60 backdrop-blur-md">
          <div className="md:hidden mb-6">
            <Logo />
          </div>

          {showRegister ? (
            <SignUp setShowRegister={setShowRegister} />
          ) : (
            <Login setShowRegister={setShowRegister} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
