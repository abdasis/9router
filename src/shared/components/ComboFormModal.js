"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import ModelSelectModal from "./ModelSelectModal";

const VALID_NAME_REGEX = /^[a-zA-Z0-9_.\-]+$/;

// Inline editable model item
function ModelItem({ index, model, isFirst, isLast, onEdit, onMoveUp, onMoveDown, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(model);
  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== model) onEdit(trimmed);
    else setDraft(model);
    setEditing(false);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") { setDraft(model); setEditing(false); }
  };
  return (
    <div className="group flex min-w-0 items-center gap-2 rounded-[6px] px-2.5 py-1.5 bg-surface border border-border hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors select-none">
      <span className="text-xs font-mono text-text-muted w-4 text-center shrink-0">{index + 1}</span>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 h-6 px-1.5 rounded-[4px] border border-border bg-surface-2 font-mono text-xs text-text-main outline-none focus:border-black dark:focus:border-white focus:ring-1"
        />
      ) : (
        <div
          className="min-w-0 flex-1 h-6 flex items-center px-1.5 rounded-[4px] font-mono text-xs text-text-main truncate hover:bg-surface-2 transition-colors cursor-text"
          onClick={() => setEditing(true)}
          title="Click to edit"
        >
          {model}
        </div>
      )}
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-1 rounded-[4px] text-text-muted hover:text-text-main hover:bg-surface-2 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
          title="Move up"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="p-1 rounded-[4px] text-text-muted hover:text-text-main hover:bg-surface-2 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
          title="Move down"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
        </button>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1 rounded-[4px] text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
        title="Remove"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </div>
  );
}

// Reusable Combo create/edit modal. forcePrefix auto-prepends to name.
export default function ComboFormModal({ isOpen, combo, onClose, onSave, activeProviders, kindFilter = null, forcePrefix = "", title }) {
  // Strip prefix when editing existing combo so user only edits suffix
  const initialName = combo?.name
    ? (forcePrefix && combo.name.startsWith(forcePrefix) ? combo.name.slice(forcePrefix.length) : combo.name)
    : "";
  const [name, setName] = useState(initialName);
  const [models, setModels] = useState(combo?.models || []);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const [modelAliases, setModelAliases] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/models/alias").then((r) => r.ok ? r.json() : null).then((d) => d && setModelAliases(d.aliases || {})).catch(() => {});
  }, [isOpen]);

  const validateName = (value) => {
    if (!value.trim()) { setNameError("Name is required"); return false; }
    const full = forcePrefix + value;
    if (!VALID_NAME_REGEX.test(full)) { setNameError("Only letters, numbers, -, _ and . allowed"); return false; }
    setNameError("");
    return true;
  };

  const handleNameChange = (e) => {
    let value = e.target.value;
    // If user types prefix manually, strip it (we always prepend)
    if (forcePrefix && value.startsWith(forcePrefix)) value = value.slice(forcePrefix.length);
    setName(value);
    if (value) validateName(value); else setNameError("");
  };

  const handleAddModel = (model) => {
    if (!models.includes(model.value)) setModels([...models, model.value]);
  };
  const handleDeselectModel = (model) => {
    setModels(models.filter((m) => m !== model.value));
  };
  const handleRemoveModel = (i) => setModels(models.filter((_, idx) => idx !== i));
  const handleMoveUp = (i) => {
    if (i === 0) return;
    const a = [...models]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; setModels(a);
  };
  const handleMoveDown = (i) => {
    if (i === models.length - 1) return;
    const a = [...models]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; setModels(a);
  };

  const handleSave = async () => {
    if (!validateName(name)) return;
    setSaving(true);
    await onSave({ name: forcePrefix + name.trim(), models });
    setSaving(false);
  };

  const isEdit = !!combo;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title || (isEdit ? "Edit Combo" : "Create Combo")}
        size="md"
        footer={
          <>
            <Button onClick={onClose} variant="secondary" size="sm">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              size="sm"
              loading={saving}
              disabled={!name.trim() || !!nameError || saving}
            >
              {isEdit ? "Save Changes" : "Create Combo"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div>
            {forcePrefix ? (
              <>
                <label className="text-xs font-medium text-text-main mb-1.5 block">Combo Name</label>
                <div className="flex items-stretch">
                  <span className="inline-flex items-center px-2.5 rounded-l-[6px] border border-r-0 border-border bg-surface-2 text-text-muted font-mono text-xs">
                    {forcePrefix}
                  </span>
                  <input
                    value={name}
                    onChange={handleNameChange}
                    placeholder="my-combo"
                    className="flex-1 min-w-0 rounded-r-[6px] border border-border bg-surface px-2.5 py-1.5 font-mono text-xs text-text-main outline-none focus:border-black dark:focus:border-white focus:ring-1"
                  />
                </div>
                {nameError && <p className="text-[11px] text-red-500 mt-1">{nameError}</p>}
              </>
            ) : (
              <Input
                label="Combo Name"
                value={name}
                onChange={handleNameChange}
                placeholder="my-combo"
                error={nameError}
              />
            )}
            <p className="text-[11px] text-text-muted mt-1">
              {forcePrefix ? `Auto-prefixed with "${forcePrefix}". ` : ""}Only letters, numbers, -, _ and . allowed
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-text-main">Models</label>
              <span className="text-[11px] font-mono text-text-muted">
                {models.length} model{models.length === 1 ? "" : "s"}
              </span>
            </div>

            {models.length === 0 ? (
              <div className="text-center py-3 border border-dashed border-border rounded-[6px] bg-surface-2/30">
                <span className="material-symbols-outlined text-text-muted text-xl mb-1 block">layers</span>
                <p className="text-xs text-text-muted">No models added yet</p>
              </div>
            ) : (
              <div className="flex max-h-[220px] min-w-0 flex-col gap-1.5 overflow-y-auto">
                {models.map((model, index) => (
                  <ModelItem
                    key={index}
                    index={index}
                    model={model}
                    isFirst={index === 0}
                    isLast={index === models.length - 1}
                    onEdit={(v) => {
                      const a = [...models];
                      a[index] = v;
                      setModels(a);
                    }}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    onRemove={() => handleRemoveModel(index)}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowModelSelect(true)}
              className="w-full mt-2.5 py-2 border border-dashed border-border rounded-[6px] text-xs text-text-main font-medium hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-surface-2/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Model
            </button>
          </div>
        </div>
      </Modal>

      {showModelSelect && (
        <ModelSelectModal isOpen={showModelSelect} onClose={() => setShowModelSelect(false)}
          onSelect={handleAddModel} onDeselect={handleDeselectModel}
          activeProviders={activeProviders} modelAliases={modelAliases}
          title="Add Model to Combo" kindFilter={kindFilter}
          addedModelValues={models} closeOnSelect={false} />
      )}
    </>
  );
}
