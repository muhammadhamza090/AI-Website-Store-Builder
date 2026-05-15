"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type CommonProps = {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
  asChild?: boolean;
};

function styles({ variant = "default", size = "md" }: Pick<CommonProps, "variant" | "size">) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:pointer-events-none disabled:opacity-50";
  const sizes: Record<NonNullable<CommonProps["size"]>, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base"
  };
  const variants: Record<NonNullable<CommonProps["variant"]>, string> = {
    default: "bg-indigo-600 text-white shadow hover:bg-indigo-700",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
    outline: "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
    ghost: "text-zinc-900 hover:bg-zinc-100"
  };
  return cn(base, sizes[size], variants[variant]);
}

export function Button(
  props: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { className, variant, size, asChild, children, ...rest } = props;

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error("Button with asChild expects a single React element child");
    }

    const childProps = (children.props ?? {}) as { className?: string };
    return React.cloneElement(children, {
      className: cn(styles({ variant, size }), childProps.className, className)
    });
  }

  return (
    <button className={cn(styles({ variant, size }), className)} {...rest}>
      {children}
    </button>
  );
}

