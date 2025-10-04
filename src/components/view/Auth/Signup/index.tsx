"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
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
import { useStorefrontMutation } from "@/hooks/useStorefront";
import { CUSTOMER_CREATE } from "@/graphql/auth";
import { toast } from "sonner";
import { CustomerCreateResponse } from "@/types";
import { motion } from "framer-motion";

const signupSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;
type SignupFormProps = {
  setShowRegister: (show: boolean) => void;
};

const Signup = ({ setShowRegister }: SignupFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useStorefrontMutation<CustomerCreateResponse>();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignupFormValues) {
    setIsLoading(true);
    try {
      const response = await mutate({
        query: CUSTOMER_CREATE,
        variables: {
          input: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
          },
        },
      });

      if (response.customerCreate.customerUserErrors.length > 0) {
        throw new Error(response.customerCreate.customerUserErrors[0].message);
      }

      toast.success("Account created successfully! Please log in.");
      form.reset();
      setShowRegister(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
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
        Create Account
      </h1>
      <p className="text-center text-gray-500 mb-8 text-sm sm:text-base">
        Join the Urbanic Pitara family
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
          {/* Fields */}
          {["firstName", "lastName", "email", "password", "confirmPassword"].map(
            (fieldName) => (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName as keyof SignupFormValues}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 capitalize text-sm">
                      {fieldName === "confirmPassword"
                        ? "Confirm Password"
                        : fieldName}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={
                          fieldName.includes("password") ? "password" : "text"
                        }
                        {...field}
                        className="border-gray-300 focus-visible:ring-2 focus-visible:ring-[#c4a676] focus-visible:border-[#c4a676]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Button
              variant="link"
              onClick={() => setShowRegister(false)}
              className="text-sm text-gray-600 hover:text-[#bfa065]"
            >
              Already have an account? <b className="ml-1">Login</b>
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-[#c4a676] hover:bg-[#b39054] text-white font-medium shadow-md transition"
            >
              {isLoading ? "Creating..." : "Sign Up"}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

export default Signup;
