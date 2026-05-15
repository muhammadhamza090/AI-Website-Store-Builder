import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" | "outline" }) {
  const variants: Record<string, string> = {
    default: "bg-indigo-600 text-white",
    secondary: "bg-zinc-100 text-zinc-900",
    outline: "border border-zinc-200 bg-white text-zinc-900"
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

