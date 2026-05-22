"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { STATUS_META } from "@/lib/inventory";
import type { InventoryItem, InventoryResponse, InventorySummary, StockStatus } from "@/types";
import StockAdjustModal from "./StockAdjustModal";
import MovementHistoryModal from "./MovementHistoryModal";

type StatusFilter = "all" | StockStatus;

const EMPTY_SUMMARY: InventorySummary = {
  totalSkus: 0, totalUnits: 0, totalRetailValue: 0, totalCostValue: 0,
  lowStockCount: 0, outOfStockCount: 0,
};

const money = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const thStyle = {
  padding: "0.75rem 1rem", textAlign: "left" as const, fontSize: 11, fontWeight: 600,
  color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase" as const,
  borderBottom: "1px solid var(--border-color)", whiteSpace: "nowrap" as const,
};
const tdStyle = { padding: "0.625rem 1rem", fontSize: 13, borderBottom: "1px solid var(--border-color)" };

export default function InventoryClient() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory");
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as InventoryResponse;
      setItems(data.items);
      setSummary(data.summary);
      setError("");
    } catch {
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Quick single-unit change without opening the modal.
  const quickAdjust = async (item: InventoryItem, dir: 1 | -1) => {
    if (dir === -1 && item.quantity === 0) return;
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/inventory/${item.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "delta", value: dir, type: "adjustment", note: null }),
      });
      if (res.ok) await load();
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        (i.sku?.toLowerCase().includes(q) ?? false) ||
        i.categoryName.toLowerCase().includes(q)
      );
    });
  }, [items, search, statusFilter]);

  const cards = [
    { label: "Total SKUs", value: String(summary.totalSkus), color: "#1A1A1A" },
    { label: "Units on Hand", value: String(summary.totalUnits), color: "#1A1A1A" },
    { label: "Retail Value", value: `$${money(summary.totalRetailValue)}`, color: "#2a7a2a" },
    { label: "Cost Value", value: `$${money(summary.totalCostValue)}`, color: "#6366F1" },
    { label: "Low Stock", value: String(summary.lowStockCount), color: "#B5532A", filter: "low" as const },
    { label: "Out of Stock", value: String(summary.outOfStockCount), color: "#cc4444", filter: "out" as const },
  ];

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {cards.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => c.filter && setStatusFilter((f) => (f === c.filter ? "all" : c.filter!))}
            style={{
              textAlign: "left", background: "white", border: "1px solid var(--border-color)",
              borderRadius: 12, padding: "1rem 1.125rem", cursor: c.filter ? "pointer" : "default",
              outline: c.filter && statusFilter === c.filter ? `2px solid ${c.color}` : "none",
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: c.color, marginBottom: 2 }}>{c.value}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{c.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, SKU or category…"
          style={{ flex: "1 1 240px", padding: "0.5rem 0.875rem", borderRadius: 8, border: "1px solid var(--border-color)", fontSize: 13, background: "white" }}
        />
        <div style={{ display: "flex", gap: 4 }}>
          {(["all", "ok", "low", "out"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "0.5rem 0.875rem", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${statusFilter === s ? "var(--primary)" : "var(--border-color)"}`,
                background: statusFilter === s ? "var(--primary)" : "white",
                color: statusFilter === s ? "white" : "#1A1A1A", textTransform: "capitalize",
              }}
            >
              {s === "ok" ? "In stock" : s === "out" ? "Out" : s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(204,68,68,0.08)", border: "1px solid rgba(204,68,68,0.3)", color: "#cc4444", borderRadius: 8, padding: "0.625rem 0.875rem", fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border-color)", overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
            {items.length === 0 ? (
              <>No products yet. <Link href="/admin/products/new" style={{ color: "var(--primary)" }}>Add one →</Link></>
            ) : (
              "No products match this filter."
            )}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Category</th>
                <th style={{ ...thStyle, textAlign: "center" }}>On Hand</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Price</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Stock Value</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const sm = STATUS_META[item.status];
                return (
                  <tr key={item.id}>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 6, overflow: "hidden", background: "#f5f0eb", position: "relative", flexShrink: 0 }}>
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="40px" />
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 16 }}>📷</div>
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500 }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                            {item.sku ?? "no SKU"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, color: "var(--muted)", fontSize: 12 }}>{item.categoryName}</td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => quickAdjust(item, -1)}
                          disabled={busyId === item.id || item.quantity === 0}
                          aria-label="Remove one"
                          style={qtyBtnStyle(busyId === item.id || item.quantity === 0)}
                        >
                          −
                        </button>
                        <span style={{ minWidth: 56, display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
                          <strong style={{ fontSize: 15 }}>{item.quantity}</strong>
                          <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: sm.bg, color: sm.color, marginTop: 2 }}>
                            {sm.label}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => quickAdjust(item, 1)}
                          disabled={busyId === item.id}
                          aria-label="Add one"
                          style={qtyBtnStyle(busyId === item.id)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, color: "var(--primary)" }}>
                      {money(item.price)} {item.currency}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{money(item.stockValue)}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button type="button" onClick={() => setAdjustItem(item)} style={actionBtnStyle(true)}>Adjust</button>
                        <button type="button" onClick={() => setHistoryItem(item)} style={actionBtnStyle(false)}>History</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {adjustItem && (
        <StockAdjustModal
          item={adjustItem}
          onClose={() => setAdjustItem(null)}
          onDone={() => {
            setAdjustItem(null);
            load();
          }}
        />
      )}
      {historyItem && (
        <MovementHistoryModal item={historyItem} onClose={() => setHistoryItem(null)} />
      )}
    </div>
  );
}

function qtyBtnStyle(disabled: boolean) {
  return {
    width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border-color)",
    background: disabled ? "#f5f5f5" : "white", color: disabled ? "#bbb" : "#1A1A1A",
    cursor: disabled ? "not-allowed" : "pointer", fontSize: 16, lineHeight: 1,
    display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  } as const;
}

function actionBtnStyle(primary: boolean) {
  return {
    padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
    border: primary ? "none" : "1px solid var(--border-color)",
    background: primary ? "rgba(181,83,42,0.1)" : "white",
    color: primary ? "var(--primary)" : "#1A1A1A",
  } as const;
}
