"use client";

import { cn } from "@/shared/utils/cn";

const sizes = {
  sm: "h-6 text-[11px] px-2",
  md: "h-7 text-xs px-2.5",
  lg: "h-8 text-sm px-3",
};

export default function SegmentedControl({
  options = [],
  value,
  onChange,
  size = "md",
  className,
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center p-0.5 rounded-[6px] bg-surface-2 border border-border overflow-x-auto select-none",
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 inline-flex items-center justify-center transition-colors cursor-pointer",
              sizes[size] || sizes.md,
              isActive
                ? "bg-surface text-text-main shadow-xs font-medium rounded-[4px] border border-border/80"
                : "text-text-muted hover:text-text-main font-normal border border-transparent"
            )}
          >
            {option.icon && (
              <span className="material-symbols-outlined text-[16px] mr-1.5">
                {option.icon}
              </span>
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
