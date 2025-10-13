"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import Logo from "@/components/view/Logo";
import SignUp from "@/components/view/Auth/Signup";
import Login from "@/components/view/Auth/Login";

const Auth = () => {
  const router = useRouter();
  const [showRegister, setShowRegister] = useState(false);
  const cookies = parseCookies();
  const customerAccessToken = cookies.customerAccessToken;

  useEffect(() => {
    if (customerAccessToken) router.push("/");
  }, [customerAccessToken, router]);

  const handleSignup = async (data: any) => {
    try {
      const res = await fetch("http://localhost:4000/auth/signup", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Signup failed");
      }

      const json = await res.json();
      if (json.token) {
        localStorage.setItem("auth_token", json.token);
      }

      router.refresh();
      router.push("/");
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
