"use client";

import { useState } from "react";
import { MOVEMENT_META } from "@/lib/inventory";
import type { InventoryItem, MovementType } from "@/types";
import ModalShell from "./ModalShell";

interface Props {
  item: InventoryItem;
  onClose: () => void;
  onDone: (updated: InventoryItem) => void;
}

// Movement types offered when adding/removing units (not stock-count).
const ADJUST_TYPES: MovementType[] = ["restock", "sale", "return", "damage", "adjustment"];

const inputStyle = {
  width: "100%",
  padding: "0.625rem 0.875rem",
  borderRadius: 8,
  border: "1px solid var(--border-color)",
  fontSize: 14,
  background: "white",
};
const labelStyle = { fontSize: 13, fontWeight: 500 as const, display: "block" as const, marginBottom: 6 };

export default function StockAdjustModal({ item, onClose, onDone }: Props) {
  const [tab, setTab] = useState<"adjust" | "count">("adjust");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [magnitude, setMagnitude] = useState("");
  const [type, setType] = useState<MovementType>("restock");
  const [counted, setCounted] = useState(String(item.quantity));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const mag = Number(magnitude);
  const delta = tab === "adjust" ? direction * (Number.isFinite(mag) ? mag : 0) : Number(counted) - item.quantity;
  const after = tab === "adjust" ? item.quantity + delta : Number(counted);
  const valid =
    tab === "adjust"
      ? Number.isInteger(mag) && mag > 0 && item.quantity + direction * mag >= 0
      : Number.isInteger(Number(counted)) && Number(counted) >= 0 && Number(counted) !== item.quantity;

  const submit = async () => {
    setSaving(true);
    setError("");
    const payload =
      tab === "adjust"
        ? { mode: "delta", value: direction * mag, type, note: note.trim() || null }
        : { mode: "set", value: Number(counted), type: "count", note: note.trim() || null };
    try {
      const res = await fetch(`/api/inventory/${item.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to adjust stock");
        return;
      }
      onDone(data.item as InventoryItem);
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  };

  const tabButton = (key: "adjust" | "count", label: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      style={{
        flex: 1,
        padding: "0.5rem",
        borderRadius: 8,
        border: "1px solid var(--border-color)",
        background: tab === key ? "var(--primary)" : "white",
        color: tab === key ? "white" : "#1A1A1A",
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <ModalShell title={`Adjust Stock — ${item.name}`} onClose={onClose}>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
        On hand now: <strong style={{ color: "#1A1A1A" }}>{item.quantity}</strong>
        {item.sku && <> · SKU {item.sku}</>}
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {tabButton("adjust", "Add / Remove")}
        {tabButton("count", "Stock Count")}
      </div>

      {tab === "adjust" ? (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Direction</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setDirection(1)}
                style={{
                  flex: 1, padding: "0.5rem", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13,
                  border: `1px solid ${direction === 1 ? "#2a7a2a" : "var(--border-color)"}`,
                  background: direction === 1 ? "rgba(42,122,42,0.1)" : "white",
                  color: direction === 1 ? "#2a7a2a" : "#1A1A1A",
                }}
              >
                + Add
              </button>
              <button
                type="button"
                onClick={() => setDirection(-1)}
                style={{
                  flex: 1, padding: "0.5rem", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13,
                  border: `1px solid ${direction === -1 ? "#cc4444" : "var(--border-color)"}`,
                  background: direction === -1 ? "rgba(204,68,68,0.1)" : "white",
                  color: direction === -1 ? "#cc4444" : "#1A1A1A",
                }}
              >
                − Remove
              </button>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Quantity</label>
            <input
              style={inputStyle}
              type="number"
              min="1"
              step="1"
              value={magnitude}
              onChange={(e) => setMagnitude(e.target.value)}
              placeholder="e.g. 10"
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Reason</label>
            <select style={inputStyle} value={type} onChange={(e) => setType(e.target.value as MovementType)}>
              {ADJUST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {MOVEMENT_META[t].icon} {MOVEMENT_META[t].label}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Counted quantity on hand</label>
          <input
            style={inputStyle}
            type="number"
            min="0"
            step="1"
            value={counted}
            onChange={(e) => setCounted(e.target.value)}
            autoFocus
          />
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
            Enter the physical count — the difference is recorded as a stock count adjustment.
          </p>
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Note (optional)</label>
        <input
          style={inputStyle}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. supplier delivery #1024"
          maxLength={500}
        />
      </div>

      {valid && (
        <div style={{ background: "#fafafa", borderRadius: 8, padding: "0.625rem 0.875rem", fontSize: 13, marginBottom: 14 }}>
          New on-hand: <strong>{after}</strong>{" "}
          <span style={{ color: delta >= 0 ? "#2a7a2a" : "#cc4444", fontWeight: 600 }}>
            ({delta >= 0 ? "+" : ""}{delta})
          </span>
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(204,68,68,0.08)", border: "1px solid rgba(204,68,68,0.3)", color: "#cc4444", borderRadius: 8, padding: "0.625rem 0.875rem", fontSize: 13, marginBottom: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onClose}
          style={{ padding: "0.625rem 1.25rem", borderRadius: 8, border: "1px solid var(--border-color)", background: "white", fontWeight: 500, fontSize: 13, cursor: "pointer" }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!valid || saving}
          style={{
            padding: "0.625rem 1.25rem", borderRadius: 8, border: "none",
            background: !valid || saving ? "#ccc" : "var(--primary)", color: "white",
            fontWeight: 600, fontSize: 13, cursor: !valid || saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving…" : "Apply"}
        </button>
      </div>
    </ModalShell>
  );
}
