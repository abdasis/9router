"use client";

import { useState, useEffect } from "react";
import { getDefaultPricing, formatCost } from "open-sse/providers/pricing.js";
import Modal from "./Modal";
import Button from "./Button";

export default function PricingModal({ isOpen, onClose, onSave }) {
  const [pricingData, setPricingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPricing();
    }
  }, [isOpen]);

  const loadPricing = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/pricing");
      if (response.ok) {
        const data = await response.json();
        setPricingData(data);
      } else {
        // Fallback to defaults
        const defaults = getDefaultPricing();
        setPricingData(defaults);
      }
    } catch (error) {
      console.error("Failed to load pricing:", error);
      const defaults = getDefaultPricing();
      setPricingData(defaults);
    } finally {
      setLoading(false);
    }
  };

  const handlePricingChange = (provider, model, field, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    setPricingData(prev => {
      const newData = { ...prev };
      if (!newData[provider]) newData[provider] = {};
      if (!newData[provider][model]) newData[provider][model] = {};
      newData[provider][model][field] = numValue;
      return newData;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricingData)
      });

      if (response.ok) {
        onSave?.();
        onClose();
      } else {
        const error = await response.json();
        alert(`Failed to save pricing: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to save pricing:", error);
      alert("Failed to save pricing");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset all pricing to defaults? This cannot be undone.")) return;

    try {
      const response = await fetch("/api/pricing", { method: "DELETE" });
      if (response.ok) {
        const defaults = getDefaultPricing();
        setPricingData(defaults);
      }
    } catch (error) {
      console.error("Failed to reset pricing:", error);
      alert("Failed to reset pricing");
    }
  };

  if (!isOpen) return null;

  // Get all unique providers and models for display
  const allProviders = Object.keys(pricingData).sort();
  const pricingFields = ["input", "output", "cached", "reasoning", "cache_creation"];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pricing Configuration"
      className="max-w-6xl flex flex-col max-h-[90vh]"
      footer={
        <div className="flex items-center justify-between gap-2 w-full">
          <Button
            variant="danger"
            onClick={handleReset}
            disabled={saving}
          >
            Reset to Defaults
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
            >
              Save Changes
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="text-center py-8 text-text-muted">Loading pricing data...</div>
        ) : (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-surface-2 border border-border rounded-[6px] p-3 text-sm">
              <p className="font-medium mb-1 text-text-main">Pricing Rates Format</p>
              <p className="text-text-muted">
                All rates are in <strong>dollars per million tokens</strong> ($/1M tokens).
                Example: Input rate of 2.50 means $2.50 per 1,000,000 input tokens.
              </p>
            </div>

            {/* Pricing Tables */}
            {allProviders.map(provider => {
              const models = Object.keys(pricingData[provider]).sort();
              return (
                <div key={provider} className="border border-border rounded-[6px] overflow-hidden">
                  <div className="bg-surface-2 px-4 py-2 font-semibold text-sm text-text-main">
                    {provider.toUpperCase()}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-3 text-text-muted uppercase text-xs">
                        <tr>
                          <th className="px-3 py-2 text-left">Model</th>
                          <th className="px-3 py-2 text-right">Input</th>
                          <th className="px-3 py-2 text-right">Output</th>
                          <th className="px-3 py-2 text-right">Cached</th>
                          <th className="px-3 py-2 text-right">Reasoning</th>
                          <th className="px-3 py-2 text-right">Cache Creation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {models.map(model => (
                          <tr key={model} className="hover:bg-surface-2">
                            <td className="px-3 py-2 font-medium text-text-main">{model}</td>
                            {pricingFields.map(field => (
                              <td key={field} className="px-3 py-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={pricingData[provider][model][field] || 0}
                                  onChange={(e) => handlePricingChange(provider, model, field, e.target.value)}
                                  className="w-20 px-2 py-1 text-right bg-surface border border-border rounded-[6px] text-text-main focus:outline-none focus:border-black dark:focus:border-white"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {allProviders.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                No pricing data available
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}