"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { APP_CONFIG, UPDATER_CONFIG } from "@/shared/constants/config";
import { MEDIA_PROVIDER_KINDS } from "@/shared/constants/providers";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import Button from "./Button";
import { ConfirmModal } from "./Modal";
import NineRemotePromoModal from "./NineRemotePromoModal";

const VISIBLE_MEDIA_KINDS = ["embedding", "image", "video", "tts", "stt"];
// Combined entry: webSearch + webFetch share one page at /dashboard/media-providers/web
const COMBINED_WEB_ITEM = { id: "web", label: "Web Fetch & Search", icon: "travel_explore", href: "/dashboard/media-providers/web" };

const navItems = [
  { href: "/dashboard/endpoint", label: "Endpoint & Key", icon: "api" },
  { href: "/dashboard/providers", label: "Providers", icon: "dns" },
  { href: "/dashboard/combos", label: "Combo & Vision Adapter", icon: "layers" },
  { href: "/dashboard/usage", label: "Usage", icon: "bar_chart" },
  { href: "/dashboard/quota", label: "Quota Tracker", icon: "data_usage" },
  { href: "/dashboard/token-saver", label: "Token Saver", icon: "savings" },
  { href: "/dashboard/cli-tools", label: "CLI Tools", icon: "terminal" },
];

const debugItems = [
  { href: "/dashboard/console-log", label: "Console Log", icon: "terminal" },
  { href: "/dashboard/translator", label: "Translator", icon: "translate" },
];

const systemItems = [
  { href: "/dashboard/proxy-pools", label: "Proxy Pools", icon: "lan" },
  { href: "/dashboard/skills", label: "Skills", icon: "extension" },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const [mediaOpen, setMediaOpen] = useState(false);
  const [showRemoteModal, setShowRemoteModal] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [shutdownCountdown, setShutdownCountdown] = useState(0);
  const [enableTranslator, setEnableTranslator] = useState(false);
  const { copied, copy } = useCopyToClipboard(2000);

  const INSTALL_CMD = UPDATER_CONFIG.installCmdLatest;

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.enableTranslator) setEnableTranslator(true);
      })
      .catch(() => {});
  }, []);

  // Lazy check for new npm version on mount
  useEffect(() => {
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasUpdate) setUpdateInfo(data);
      })
      .catch(() => {});
  }, []);

  const isActive = (href) => {
    if (href === "/dashboard/endpoint") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/endpoint");
    }
    return pathname.startsWith(href);
  };

  // Open manual update panel (no countdown yet — user must click Copy to trigger shutdown)
  const handleUpdate = () => {
    setShowUpdateModal(false);
    setIsUpdating(true);
  };

  // Triggered by Copy button inside ManualUpdatePanel: copy + countdown + shutdown
  const handleCopyAndShutdown = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
    } catch {
      /* clipboard blocked */
    }
    copy(INSTALL_CMD);
    let remaining = UPDATER_CONFIG.shutdownCountdownSec;
    setShutdownCountdown(remaining);
    const timer = setInterval(() => {
      remaining -= 1;
      setShutdownCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        fetch("/api/version/shutdown", { method: "POST" }).catch(() => {});
        setIsDisconnected(true);
      }
    }, 1000);
  };

  const handleCancelUpdate = () => {
    setIsUpdating(false);
    setShutdownCountdown(0);
  };

  return (
    <>
      <aside className="flex w-64 flex-col border-r border-border bg-surface transition-colors duration-300 h-full select-none">
        {/* Header logo */}
        <div className="h-14 px-4 border-b border-border flex items-center justify-between shrink-0">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center size-7 rounded-[6px] bg-black text-white dark:bg-white dark:text-black shrink-0 font-semibold text-xs shadow-xs">
              <span className="material-symbols-outlined text-[16px]">hub</span>
            </div>
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-sm font-medium text-text-main tracking-tight truncate">
                {APP_CONFIG.name}
              </span>
              <span className="text-[11px] text-text-muted font-mono">v{APP_CONFIG.version}</span>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-[6px] text-text-muted hover:text-text-main lg:hidden"
              aria-label="Close sidebar"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] text-[13px] font-normal transition-colors group",
                  active
                    ? "bg-surface-2 text-text-main font-medium"
                    : "text-text-muted hover:bg-surface-2 hover:text-text-main"
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-[18px]",
                    active ? "text-text-main" : "text-text-muted group-hover:text-text-main transition-colors"
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* System section */}
          <div className="pt-2 mt-2 space-y-0.5">
            <p className="px-2.5 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-text-subtle">
              System
            </p>

            {/* Media Providers accordion */}
            <button
              onClick={() => setMediaOpen((v) => !v)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] text-[13px] font-normal transition-colors group cursor-pointer",
                pathname.startsWith("/dashboard/media-providers")
                  ? "bg-surface-2 text-text-main font-medium"
                  : "text-text-muted hover:bg-surface-2 hover:text-text-main"
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-[18px]",
                  pathname.startsWith("/dashboard/media-providers")
                    ? "text-text-main"
                    : "text-text-muted group-hover:text-text-main transition-colors"
                )}
              >
                perm_media
              </span>
              <span className="flex-1 text-left">Media Providers</span>
              <span
                className="material-symbols-outlined text-[16px] text-text-muted transition-transform duration-200"
                style={{ transform: mediaOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                expand_more
              </span>
            </button>
            {mediaOpen && (
              <div className="ml-3 pl-2.5 border-l border-border space-y-0.5 my-1">
                {MEDIA_PROVIDER_KINDS.filter((k) => VISIBLE_MEDIA_KINDS.includes(k.id)).map((kind) => {
                  const active = pathname.startsWith(`/dashboard/media-providers/${kind.id}`);
                  return (
                    <Link
                      key={kind.id}
                      href={`/dashboard/media-providers/${kind.id}`}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1 rounded-[6px] text-[12px] transition-colors group",
                        active
                          ? "bg-surface-2 text-text-main font-medium"
                          : "text-text-muted hover:bg-surface-2 hover:text-text-main"
                      )}
                    >
                      <span
                        className={cn(
                          "material-symbols-outlined text-[15px]",
                          active ? "text-text-main" : "text-text-muted group-hover:text-text-main transition-colors"
                        )}
                      >
                        {kind.icon}
                      </span>
                      <span className="truncate">{kind.label}</span>
                    </Link>
                  );
                })}
                {(() => {
                  const active = pathname.startsWith(COMBINED_WEB_ITEM.href);
                  return (
                    <Link
                      key={COMBINED_WEB_ITEM.id}
                      href={COMBINED_WEB_ITEM.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1 rounded-[6px] text-[12px] transition-colors group",
                        active
                          ? "bg-surface-2 text-text-main font-medium"
                          : "text-text-muted hover:bg-surface-2 hover:text-text-main"
                      )}
                    >
                      <span
                        className={cn(
                          "material-symbols-outlined text-[15px]",
                          active ? "text-text-main" : "text-text-muted group-hover:text-text-main transition-colors"
                        )}
                      >
                        {COMBINED_WEB_ITEM.icon}
                      </span>
                      <span className="truncate">{COMBINED_WEB_ITEM.label}</span>
                    </Link>
                  );
                })()}
              </div>
            )}

            {systemItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] text-[13px] font-normal transition-colors group",
                    active
                      ? "bg-surface-2 text-text-main font-medium"
                      : "text-text-muted hover:bg-surface-2 hover:text-text-main"
                  )}
                >
                  <span
                    className={cn(
                      "material-symbols-outlined text-[18px]",
                      active ? "text-text-main" : "text-text-muted group-hover:text-text-main transition-colors"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Debug items */}
            {debugItems.map((item) => {
              const show = item.href !== "/dashboard/translator" || enableTranslator;
              if (!show) return null;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] text-[13px] font-normal transition-colors group",
                    active
                      ? "bg-surface-2 text-text-main font-medium"
                      : "text-text-muted hover:bg-surface-2 hover:text-text-main"
                  )}
                >
                  <span
                    className={cn(
                      "material-symbols-outlined text-[18px]",
                      active ? "text-text-main" : "text-text-muted group-hover:text-text-main transition-colors"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer / Bottom area */}
        <div className="shrink-0 border-t border-border p-3 space-y-1.5">
          {/* Update banner */}
          {updateInfo && (
            <div className="p-2 rounded-[6px] border border-border bg-surface-2 text-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-text-main font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span>v{updateInfo.latestVersion} available</span>
                </div>
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="text-[11px] font-medium text-text-main hover:underline cursor-pointer"
                >
                  Update
                </button>
              </div>
              <button
                onClick={() => copy(INSTALL_CMD)}
                title="Copy install command"
                className="w-full text-left px-1.5 py-1 rounded-[4px] bg-surface border border-border hover:bg-surface-3 transition-colors cursor-pointer"
              >
                <code className="block text-[10px] text-text-muted font-mono truncate">
                  {copied ? "✓ copied to clipboard" : INSTALL_CMD}
                </code>
              </button>
            </div>
          )}

          {/* Settings link */}
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] text-[13px] font-normal transition-colors group",
              isActive("/dashboard/profile")
                ? "bg-surface-2 text-text-main font-medium"
                : "text-text-muted hover:bg-surface-2 hover:text-text-main"
            )}
          >
            <span
              className={cn(
                "material-symbols-outlined text-[18px]",
                isActive("/dashboard/profile")
                  ? "text-text-main"
                  : "text-text-muted group-hover:text-text-main transition-colors"
              )}
            >
              settings
            </span>
            <span className="flex-1">Settings</span>
          </Link>

          {/* Secondary links: 9Remote & 9English */}
          <div className="flex items-center gap-1 pt-1 text-[11px] text-text-subtle">
            <button
              onClick={() => setShowRemoteModal(true)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-[6px] hover:bg-surface-2 hover:text-text-main transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">computer</span>
              <span>9Remote</span>
            </button>
            <span className="text-border">|</span>
            <a
              href="https://9english.net/"
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-[6px] hover:bg-surface-2 hover:text-text-main transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">translate</span>
              <span>9English</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Remote Promo Modal */}
      <NineRemotePromoModal isOpen={showRemoteModal} onClose={() => setShowRemoteModal(false)} />

      {/* Update Confirmation Modal */}
      <ConfirmModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={handleUpdate}
        title="Update 9Router"
        message={`Show install command for v${updateInfo?.latestVersion || ""}? You can copy it and shutdown to install manually.`}
        confirmText="Show Command"
        cancelText="Cancel"
        variant="primary"
      />

      {/* Disconnected / Updating Overlay */}
      {(isDisconnected || isUpdating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          {isUpdating ? (
            <ManualUpdatePanel
              latestVersion={updateInfo?.latestVersion}
              installCmd={INSTALL_CMD}
              copied={copied}
              onCopyAndShutdown={handleCopyAndShutdown}
              onCancel={handleCancelUpdate}
              countdown={shutdownCountdown}
              isDisconnected={isDisconnected}
            />
          ) : (
            <div className="text-center p-8">
              <div className="flex items-center justify-center size-16 rounded-full bg-red-500/20 text-red-500 mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px]">power_off</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Server Disconnected</h2>
              <p className="text-text-muted mb-6">The proxy server has been stopped.</p>
              <Button variant="secondary" onClick={() => globalThis.location.reload()}>
                Reload Page
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

Sidebar.propTypes = {
  onClose: PropTypes.func,
};

function ManualUpdatePanel({ latestVersion, installCmd, copied, onCopyAndShutdown, onCancel, countdown, isDisconnected }) {
  const isCountingDown = countdown > 0;
  return (
    <div className="w-full max-w-lg rounded-[8px] bg-surface border border-border p-6 text-text-main shadow-[var(--shadow-elev)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center size-10 rounded-[6px] bg-surface-2 text-text-main border border-border">
          <span className="material-symbols-outlined text-[20px]">content_copy</span>
        </div>
        <div>
          <h2 className="text-base font-medium">Update 9Router{latestVersion ? ` to v${latestVersion}` : ""}</h2>
          <p className="text-xs text-text-muted">
            {isDisconnected
              ? "Server stopped. Paste the command into a terminal to install."
              : isCountingDown
                ? `Command copied. Server will stop in ${countdown}s...`
                : "Click the button below to copy the install command and shutdown."}
          </p>
        </div>
      </div>

      <p className="text-sm text-text-muted mb-2">Install command:</p>
      <div className="w-full px-3 py-2 rounded-[6px] bg-surface-2 border border-border mb-4">
        <code className="text-xs font-mono text-text-main break-all">{installCmd}</code>
      </div>

      <ol className="text-xs text-text-muted space-y-1 list-decimal list-inside mb-4">
        <li>Click <strong>Copy & Shutdown</strong> below.</li>
        <li>Paste the command into your terminal and press Enter.</li>
        <li>Run <code className="px-1 py-0.5 rounded-[4px] bg-surface-3 text-text-main font-mono">9router</code> again after install.</li>
      </ol>

      {isDisconnected ? (
        <Button variant="secondary" fullWidth onClick={() => globalThis.location.reload()}>
          Reload Page
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isCountingDown}>
            Cancel
          </Button>
          <Button variant="primary" fullWidth onClick={onCopyAndShutdown} disabled={isCountingDown}>
            {copied ? "✓ Copied — shutting down..." : isCountingDown ? `Shutting down in ${countdown}s` : "Copy & Shutdown"}
          </Button>
        </div>
      )}
    </div>
  );
}

ManualUpdatePanel.propTypes = {
  latestVersion: PropTypes.string,
  installCmd: PropTypes.string.isRequired,
  copied: PropTypes.bool,
  onCopyAndShutdown: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  countdown: PropTypes.number,
  isDisconnected: PropTypes.bool,
};
