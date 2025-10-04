"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { isAuthenticated, useStorefrontMutation } from "@/hooks/useStorefront";
import { CUSTOMER_UPDATE } from "@/graphql/profile";
import { toast } from "sonner";
import type { CustomerProfile } from "@/types/profile";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  countryCode: z.string().optional(), // e.g., +91, +1
  phone: z.preprocess((val) => {
    if (typeof val === "string") {
      const t = val.trim();
      return t === "" ? undefined : t;
    }
    return val;
  }, z.string().optional()),
});

interface CustomerUpdateResponse {
  customerUpdate?: {
    customer?: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      phone?: string | null;
    } | null;
    customerUserErrors?: Array<{
      code?: string | null;
      field?: string[] | null;
      message: string;
    }>;
  };
}

interface EditProfileFormProps {
  customerAccessToken: string;
  customer: CustomerProfile;
  onSuccess: () => void;
  trigger: React.ReactNode;
}

// Default list of common country codes (can be expanded)
const countryCodes = [
  { id: 'in', label: "🇮🇳 India", value: "+91" },
  { id: 'us', label: "🇺🇸 United States", value: "+1-us" },
  { id: 'gb', label: "🇬🇧 United Kingdom", value: "+44" },
  { id: 'ca', label: "🇨🇦 Canada", value: "+1-ca" },
  { id: 'au', label: "🇦🇺 Australia", value: "+61" },
];

export function EditProfileForm({
  customerAccessToken,
  customer,
  onSuccess,
  trigger,
}: EditProfileFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useStorefrontMutation();
  const router = useRouter();

  // Split customer.phone into countryCode and phone if possible
  const defaultCountryCode = "+91";
  const initialPhone = customer.phone || "";
  const parsedPhone = parsePhoneNumberFromString(initialPhone || "");

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: parsedPhone?.nationalNumber || "",
      countryCode: parsedPhone?.countryCallingCode
        ? `+${parsedPhone.countryCallingCode}`
        : defaultCountryCode,
    },
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!isAuthenticated()) {
      toast.error("Please login to continue");
      router.push("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      let phoneToSend: string | null = null;

      if (values.phone && values.countryCode) {
        // Strip the country identifier suffix if present
        const cleanCountryCode = values.countryCode.split('-')[0];
        const fullPhone = `${cleanCountryCode}${values.phone}`;
        const phoneParsed = parsePhoneNumberFromString(fullPhone);

        if (!phoneParsed || !phoneParsed.isValid()) {
          form.setError("phone", {
            type: "manual",
            message: "Please enter a valid phone number",
          });
          setIsSubmitting(false);
          return;
        }

        phoneToSend = phoneParsed.number; // E.164 format
      }

      const raw = await mutate({
        query: CUSTOMER_UPDATE,
        variables: {
          customerAccessToken,
          customer: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: phoneToSend,
          },
        },
      });

      const response = raw as unknown as CustomerUpdateResponse;

      if (response?.customerUpdate?.customerUserErrors?.length) {
        const err = response.customerUpdate.customerUserErrors[0];
        toast.error(err.message || "Failed to update profile");
        return;
      }

      if (response?.customerUpdate?.customer) {
        toast.success("Profile updated successfully");
        setOpen(false);
        await onSuccess();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countryCodes.map((code) => (
                          <SelectItem key={code.value} value={code.value}>
                            {code.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="9876543210"
                          inputMode="numeric"
                          onChange={(e) => {
                            const onlyNums = e.target.value.replace(/\D/g, "");
                            field.onChange(onlyNums);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
