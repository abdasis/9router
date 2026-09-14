"use client";

import { cn } from "@/shared/utils/cn";

const variants = {
  primary:
    "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 border border-transparent shadow-xs font-medium",
  secondary:
    "bg-surface border border-border text-text-main hover:bg-surface-2 hover:border-neutral-400 dark:hover:border-neutral-600 shadow-xs font-medium",
  outline:
    "border border-border text-text-main hover:bg-surface-2 hover:border-text-main font-medium",
  ghost:
    "text-text-muted hover:text-text-main hover:bg-surface-2 border border-transparent font-normal",
  danger:
    "bg-red-600 hover:bg-red-700 text-white shadow-xs border border-transparent font-medium",
  success:
    "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs border border-transparent font-medium",
};

const sizes = {
  sm: "h-7 px-2.5 text-xs rounded-[6px] gap-1.5",
  md: "h-8 px-3 text-xs sm:text-sm rounded-[6px] gap-2",
  lg: "h-10 px-4 text-sm rounded-[6px] gap-2",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center transition-colors duration-150 cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20",
        "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="material-symbols-outlined text-[16px]">{iconRight}</span>
      )}
    </button>
  );
}
