"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import PropTypes from "prop-types";
import { marked } from "marked";
import { GITHUB_CONFIG } from "@/shared/constants/config";

marked.setOptions({ gfm: true, breaks: true });

export default function ChangelogModal({ isOpen, onClose }) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || html) return;
    setLoading(true);
    setError("");
    fetch(GITHUB_CONFIG.changelogUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((md) => setHtml(marked.parse(md)))
      .catch((err) => setError(err.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [isOpen, html]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Log"
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
          <div className="text-red-500 py-4">Failed to load changelog: {error}</div>
        )}
        {!loading && !error && html && (
          <div
            className="changelog-body text-text-main"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </Modal>
  );
}

ChangelogModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
