"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import PropTypes from "prop-types";
import { GITHUB_CONFIG } from "@/shared/constants/config";

export default function DonateModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || data) return;
    setLoading(true);
    setError("");
    fetch(GITHUB_CONFIG.donateUrl, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [isOpen, data]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-pink-500">volunteer_activism</span>
          {data?.title || "Support 9Router"}
        </span>
      }
      className="max-w-3xl"
    >
      <div className="flex-1">
        {loading && (
          <div className="flex items-center justify-center py-10 text-text-muted">
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            Loading...
          </div>
        )}
        {error && (
          <div className="text-red-500 py-4">Failed to load donate info: {error}</div>
        )}
        {!loading && !error && data && (
          <>
            {data.message && (
              <p className="text-text-muted text-sm mb-6 text-center">{data.message}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.channels?.map((ch) => (
                <DonateChannelCard key={ch.id} channel={ch} />
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function DonateChannelCard({ channel }) {
  const { label, description, icon, color, url, qr } = channel;
  const content = (
    <>
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <span className="material-symbols-outlined text-[26px]">{icon}</span>
      </div>
      <div className="font-semibold text-text-main mb-1">{label}</div>
      {description && (
        <div className="text-xs text-text-muted mb-3 text-center">{description}</div>
      )}
      {qr && (
        <img
          src={qr}
          alt={`${label} QR`}
          className="w-full max-w-[180px] aspect-square object-contain rounded-lg bg-white p-1"
        loading="lazy"
        decoding="async"
        />
      )}
    </>
  );

  return (
    <div className="flex flex-col items-center p-4 rounded-xl border border-black/10 dark:border-white/10 bg-surface/50 hover:border-pink-500/40 transition-colors">
      {content}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: color }}
        >
          Open
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
        </a>
      )}
    </div>
  );
}

DonateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
