import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <Link
      href="/"
      className={cn(
        "flex flex-col items-end leading-none select-none hover:opacity-90 transition-opacity",
        className
      )}
    >
      <div className="font-samarkan text-2xl md:text-3xl text-gray-900 tracking-[-0.05em]">
        urbanic<span className="tracking-[-0.1em]"> </span>pitara
      </div>
      <div className="font-samarkan text-[10px] text-gray-900 tracking-[-0.02em] mt-0.5 mr-1">
        by shubrak
      </div>
    </Link>
  );
};

export default Logo;
