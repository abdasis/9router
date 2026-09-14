"use client";

import { useEffect } from "react";
import { cn } from "@/shared/utils/cn";
import Button from "./Button";
import Tooltip from "./Tooltip";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
  showTrafficLights = false, // ponytail: deprecated in Geist UI standard, default false
  className,
}) {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Modal content */}
      <div
        className={cn(
          "relative w-full bg-surface",
          "border border-border",
          "rounded-[8px] shadow-[var(--shadow-elev)]",
          "fade-in",
          sizes[size] || sizes.md,
          className
        )}
      >
        {/* Header */}
        {(title || onClose || showTrafficLights) && (
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div className="flex items-center min-w-0">
              {/* Deprecated macOS traffic lights fallback */}
              {showTrafficLights && (
                <div className="hidden md:flex items-center gap-2 mr-4 ml-1">
                  <Tooltip text="Close" position="top" color="#FF5F56">
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close"
                      title="Close"
                      className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] hover:brightness-90 transition-all cursor-pointer flex items-center justify-center group/dot"
                    >
                      <span className="text-[9px] font-bold text-white opacity-0 group-hover/dot:opacity-100 transition-opacity leading-none">
                        ✕
                      </span>
                    </button>
                  </Tooltip>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#3a3a3a]/20 dark:bg-white/15 cursor-not-allowed" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#3a3a3a]/20 dark:bg-white/15 cursor-not-allowed" />
                </div>
              )}
              {title && (
                <h2 className="text-sm lg:text-base font-medium text-text-main truncate">
                  {title}
                </h2>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="size-7 rounded-[6px] text-text-muted hover:text-text-main hover:bg-surface-2 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-4 py-3 max-h-[calc(85vh-90px)] overflow-y-auto custom-scrollbar text-xs sm:text-sm">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-4 py-2 border-t border-border flex items-center justify-end gap-2 bg-surface-2/30 rounded-b-[8px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-text-muted text-sm">{message}</p>
    </Modal>
  );
}
