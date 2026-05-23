"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

// ... existing imports

interface VendorIconProps {
  icon?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function VendorIcon({ icon, className, size = "md" }: VendorIconProps) {
  if (!icon) return null;

  const isUrl = icon.startsWith("http");
  const sizeClasses = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5",
  };

  const sizePx = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  if (isUrl) {
    return (
      <Image
        src={icon}
        alt="Vendor Icon"
        width={sizePx[size]}
        height={sizePx[size]}
        className={cn("object-contain shrink-0", sizeClasses[size], className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center shrink-0",
        sizeClasses[size],
        className,
      )}
    >
      {icon}
    </span>
  );
}
