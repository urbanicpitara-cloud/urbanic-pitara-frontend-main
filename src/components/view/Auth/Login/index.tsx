"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { authRepository } from "@/lib/api/repositories/auth";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
// import { setCookie } from "nookies";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginFormProps = {
  setShowRegister: (show: boolean) => void;
};

const Login = ({ setShowRegister }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      
      // The login function from useAuth will handle setting the user in context

      toast.success("Login successful");
      router.refresh();
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-sm sm:max-w-md mx-auto"
    >
      <h1 className="text-3xl font-semibold text-center text-gray-900 mb-2">
        Welcome Back
      </h1>
      <p className="text-center text-gray-500 mb-8 text-sm sm:text-base">
        Log in to your Urbanic Pitara account
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
            }
          }}
        >
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 text-sm">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    {...field}
                    className="border-gray-300 focus-visible:ring-2 focus-visible:ring-[#c4a676] focus-visible:border-[#c4a676]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 text-sm">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    className="border-gray-300 focus-visible:ring-2 focus-visible:ring-[#c4a676] focus-visible:border-[#c4a676]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Button
              variant="link"
              onClick={() => setShowRegister(true)}
              className="text-sm text-gray-600 hover:text-[#bfa065]"
            >
              Don’t have an account? <b className="ml-1">Register</b>
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-[#c4a676] hover:bg-[#b39054] text-white font-medium shadow-md transition"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

export default Login;
