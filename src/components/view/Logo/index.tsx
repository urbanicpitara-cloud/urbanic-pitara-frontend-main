import { cn } from "@/lib/utils";
import React from "react";
import Link from "next/link";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link className={cn("text-sm font-medium", className)} href="/">
      Minimal Store
    </Link>
  );
};

export default Logo;
