"use client";

import { useEffect, useState } from "react";
import { MOVEMENT_META } from "@/lib/inventory";
import type { InventoryItem, StockMovement } from "@/types";
import ModalShell from "./ModalShell";

interface Props {
  item: InventoryItem;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// Read-only audit trail of every stock change for one product.
export default function MovementHistoryModal({ item, onClose }: Props) {
  const [movements, setMovements] = useState<StockMovement[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/inventory/${item.id}/movements`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((data) => active && setMovements(data as StockMovement[]))
      .catch(() => active && setError("Failed to load history"));
    return () => {
      active = false;
    };
  }, [item.id]);

  return (
    <ModalShell title={`Stock History — ${item.name}`} onClose={onClose} width={560}>
      {error ? (
        <div style={{ color: "#cc4444", fontSize: 13 }}>{error}</div>
      ) : movements === null ? (
        <div style={{ color: "var(--muted)", fontSize: 13, padding: "1rem 0" }}>Loading…</div>
      ) : movements.length === 0 ? (
        <div style={{ color: "var(--muted)", fontSize: 13, padding: "1rem 0", textAlign: "center" }}>
          No stock changes recorded yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {movements.map((m) => {
            const meta = MOVEMENT_META[m.type];
            return (
              <div
                key={m.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "0.625rem 0.25rem", borderBottom: "1px solid var(--border-color)",
                }}
              >
                <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{meta.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: meta.color }}>{meta.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{formatDate(m.createdAt)}</div>
                  {m.note && (
                    <div style={{ fontSize: 12, color: "#555", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.note}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: m.delta >= 0 ? "#2a7a2a" : "#cc4444" }}>
                    {m.delta >= 0 ? "+" : ""}{m.delta}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    {m.before} → {m.after}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ModalShell>
  );
}
