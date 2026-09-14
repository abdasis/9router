"use client";

import { cn } from "@/shared/utils/cn";

const sizes = {
  sm: { track: "w-7 h-4", thumb: "size-3", translate: "translate-x-3" },
  md: { track: "w-9 h-5", thumb: "size-4", translate: "translate-x-4" },
  lg: { track: "w-11 h-6", thumb: "size-5", translate: "translate-x-5" },
};

export default function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  className,
}) {
  const currentSize = sizes[size] || sizes.md;

  const handleClick = () => {
    if (!disabled && onChange) onChange(!checked);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20",
          checked
            ? "bg-black dark:bg-white border-transparent"
            : "bg-surface-3 border-border hover:border-neutral-400 dark:hover:border-neutral-600",
          currentSize.track,
          disabled && "cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 pointer-events-none rounded-full shadow-xs transform transition-transform duration-200 ease-in-out",
            checked
              ? `bg-white dark:bg-black ${currentSize.translate}`
              : "bg-white dark:bg-neutral-200 translate-x-0",
            currentSize.thumb
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-text-main">{label}</span>
          )}
          {description && (
            <span className="text-xs text-text-muted">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
