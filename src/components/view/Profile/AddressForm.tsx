"use client";

import { useEffect, useState } from "react";
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
import {
  CUSTOMER_ADDRESS_CREATE,
  CUSTOMER_ADDRESS_UPDATE,
} from "@/graphql/profile";
import { toast } from "sonner";
import type { Address } from "@/types/profile";

// Zod validation schema (without phone)
const addressSchema = z.object({
  address1: z.string().min(5, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "State/Province is required"),
  country: z.string().min(2, "Country is required"),
  zip: z.string().min(4, "Postal/ZIP code is required"),
});

interface AddressFormProps {
  customerAccessToken: string;
  existingAddress?: Address;
  onSuccess: () => void;
  trigger: React.ReactNode;
}

export function AddressForm({
  customerAccessToken,
  existingAddress,
  onSuccess,
  trigger,
}: AddressFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useStorefrontMutation();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth");
    }
  }, [router]);

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: existingAddress
      ? {
          address1: existingAddress.address1,
          address2: existingAddress.address2 || "",
          city: existingAddress.city,
          province: existingAddress.province,
          country: existingAddress.country,
          zip: existingAddress.zip,
        }
      : {
          address1: "",
          address2: "",
          city: "",
          province: "",
          country: "",
          zip: "",
        },
  });

  async function onSubmit(values: z.infer<typeof addressSchema>) {
    if (!isAuthenticated()) {
      toast.error("Please login to continue");
      router.push("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingAddress) {
        await mutate({
          query: CUSTOMER_ADDRESS_UPDATE,
          variables: {
            customerAccessToken,
            id: existingAddress.id,
            address: values,
          },
        });
      } else {
        await mutate({
          query: CUSTOMER_ADDRESS_CREATE,
          variables: {
            customerAccessToken,
            address: values,
          },
        });
      }

      toast.success(existingAddress ? "Address updated" : "Address added");
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to save address");
      console.log(error)
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {existingAddress ? "Edit Address" : "Add New Address"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Address Lines */}
            <FormField
              control={form.control}
              name="address1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 123 Main St" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Apt, Suite, Floor" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City & Province */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. New York" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / Province</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. NY" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Country & ZIP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. United States" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal / ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 10001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : existingAddress
                ? "Update Address"
                : "Add Address"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
