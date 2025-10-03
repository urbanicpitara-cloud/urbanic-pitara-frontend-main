"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";

// Components
import Logo from "@/components/view/Logo";
import SignUp from "@/components/view/Auth/Signup";
import Login from "@/components/view/Auth/Login";

const Auth = () => {
  const router = useRouter();
  const [showRegister, setShowRegister] = useState(false);
  const cookies = parseCookies();
  const customerAccessToken = cookies.customerAccessToken;

  useEffect(() => {
    if (customerAccessToken) {
      router.push("/");
    }
  }, [customerAccessToken, router]);

  return (
    <div className="mx-auto max-w-md">
      <div className="flex flex-col items-center justify-center my-10 border border-gray-200 rounded-lg p-10">
        <Logo />
        {showRegister ? (
          <SignUp setShowRegister={setShowRegister} />
        ) : (
          <Login setShowRegister={setShowRegister} />
        )}
      </div>
    </div>
  );
};

export default Auth;
