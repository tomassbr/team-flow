"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tokens } from "@/styles/tokens.config";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MonitorIcon, PlusIcon, EditIcon, TrashIcon, QrCodeIcon } from "@/components/icons";
import { createDesk, updateDesk, deleteDesk } from "@/lib/api/desks";
import type { Desk } from "@/types/domain";

interface DeskManagementClientProps {
  initialDesks: Desk[];
  maxDesks: number | null;
}

const TABLE_COLS = "1fr 130px 160px 56px";
const PAGE_SIZE = 10;

export function DeskManagementClient({ initialDesks, maxDesks }: DeskManagementClientProps) {
  const router = useRouter();
  const [desks, setDesks] = useState<Desk[]>(initialDesks);
  const [page, setPage] = useState(0);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addError, setAddError] = useState("");

  const [editDesk, setEditDesk] = useState<Desk | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Desk | null>(null);

  const totalDesks = desks.length;
  const activeCount = desks.filter((d) => d.isActive).length;
  const archivedCount = desks.filter((d) => !d.isActive).length;
  const totalPages = Math.max(1, Math.ceil(desks.length / PAGE_SIZE));
  const paginated = desks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  async function handleAdd() {
    const name = addName.trim();
    if (!name) { setAddError("Desk name is required."); return; }
    try {
      const created = await createDesk(name);
      setDesks((prev) => [...prev, { ...created, qrToken: null }]);
      setAddOpen(false);
      setAddName("");
      setAddError("");
      router.refresh();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleEdit() {
    if (!editDesk) return;
    const name = editName.trim();
    if (!name) { setEditError("Desk name is required."); return; }
    try {
      const updated = await updateDesk(editDesk.id, { name });
      setDesks((prev) => prev.map((d) => (d.id === editDesk.id ? { ...d, name: updated.name } : d)));
      setEditDesk(null);
      setEditError("");
      router.refresh();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleToggleActive(desk: Desk) {
    try {
      await updateDesk(desk.id, { isActive: !desk.isActive });
      setDesks((prev) => prev.map((d) => (d.id === desk.id ? { ...d, isActive: !desk.isActive } : d)));
      router.refresh();
    } catch {
      // Non-critical — table still reflects optimistic state; refresh will reconcile
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteDesk(deleteTarget.id);
      setDesks((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    } catch {
      // Let user retry via button re-enable
    }
  }

  const licenseUsed = maxDesks ? Math.round((totalDesks / maxDesks) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s16, paddingTop: tokens.space.s8 }}>

      {/* Page header — breadcrumb + title + CTA */}
      <div>
        <a
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: tokens.space.s4,
            fontSize: tokens.type.caption,
            color: tokens.color.text.muted,
            textDecoration: "none",
            marginBottom: tokens.space.s12,
          }}
        >
          <svg width={14} height={14} viewBox="0 0 256 256" fill="currentColor" aria-hidden>
            <path d="M224 128a8 8 0 0 1-8 8H59.31l58.35 58.34a8 8 0 0 1-11.32 11.32l-72-72a8 8 0 0 1 0-11.32l72-72a8 8 0 0 1 11.32 11.32L59.31 120H216a8 8 0 0 1 8 8Z"/>
          </svg>
          Dashboard
        </a>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: tokens.type.h1, fontWeight: 600, color: tokens.color.text.primary, margin: 0, letterSpacing: "-0.02em" }}>
            Manage Workspaces
          </h1>
          <button
            type="button"
            onClick={() => { setAddOpen(true); setAddName(""); setAddError(""); }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.space.s8,
              padding: `${tokens.space.s12} ${tokens.space.s24}`,
              background: tokens.color.button.primary,
              color: tokens.color.text.onAccent,
              border: "none",
              borderRadius: tokens.radius.full,
              fontSize: tokens.type.body,
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 4px 6px -4px rgba(15,23,42,0.18), 0 10px 15px -3px rgba(15,23,42,0.14)",
            }}
          >
            <PlusIcon size={16} />
            Add new desk
          </button>
        </div>
      </div>

      {/* Summary card — stats + license limit */}
      <div
        style={{
          background: tokens.color.surface.level1,
          borderRadius: tokens.radius.r20,
          border: `1px solid ${tokens.color.border.subtle}`,
          boxShadow: tokens.shadow.e1,
          display: "flex",
          alignItems: "stretch",
          overflow: "hidden",
        }}
      >
        {/* Stats */}
        {[
          { label: "TOTAL DESKS", value: totalDesks, sub: undefined },
          { label: "ACTIVE", value: activeCount, sub: "online" },
          { label: "ARCHIVED", value: archivedCount, sub: undefined },
        ].map((stat, _i) => (
          <div
            key={stat.label}
            style={{
              padding: `${tokens.space.s20} ${tokens.space.s24}`,
              borderRight: `1px solid ${tokens.color.border.subtle}`,
              minWidth: 120,
            }}
          >
            <p style={{ fontSize: tokens.type.micro, fontWeight: 600, color: tokens.color.text.muted, letterSpacing: "0.06em", marginBottom: tokens.space.s8 }}>
              {stat.label}
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: tokens.space.s4 }}>
              <span style={{ fontSize: tokens.type.display, fontWeight: 500, color: tokens.color.text.primary, letterSpacing: "-0.025em" }}>
                {stat.value}
              </span>
              {stat.sub && (
                <span style={{ fontSize: tokens.type.caption, color: tokens.color.text.muted }}>{stat.sub}</span>
              )}
            </div>
          </div>
        ))}

        {/* License limit — right side */}
        {maxDesks && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: `${tokens.space.s20} ${tokens.space.s24}`, gap: tokens.space.s16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s8, minWidth: 180 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: tokens.type.micro, fontWeight: 600, color: tokens.color.text.muted, letterSpacing: "0.06em" }}>
                  LICENSE LIMIT
                </span>
                <span style={{ fontSize: tokens.type.caption, color: tokens.color.text.secondary }}>
                  <strong style={{ color: tokens.color.text.primary }}>{totalDesks}</strong> / {maxDesks} used
                </span>
              </div>
              <div style={{ height: 6, borderRadius: tokens.radius.full, background: tokens.color.surface.level2, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, licenseUsed)}%`,
                    borderRadius: tokens.radius.full,
                    background: licenseUsed >= 90 ? tokens.color.status.error : tokens.gradient.brand,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desk list table */}
      <div
        style={{
          background: tokens.color.surface.level1,
          borderRadius: tokens.radius.r20,
          border: `1px solid ${tokens.color.border.subtle}`,
          boxShadow: tokens.shadow.e1,
          overflow: "hidden",
        }}
      >
        {/* Table toolbar — column headers + Add button */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: TABLE_COLS,
            padding: `${tokens.space.s12} ${tokens.space.s24}`,
            borderBottom: `1px solid ${tokens.color.border.subtle}`,
            alignItems: "center",
          }}
        >
          {["WORKSPACE NAME", "STATUS", "QR CODE", ""].map((col) => (
            <span key={col} style={{ fontSize: tokens.type.micro, fontWeight: 600, color: tokens.color.text.muted, letterSpacing: "0.06em" }}>
              {col}
            </span>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div style={{ padding: tokens.space.s40, textAlign: "center", color: tokens.color.text.muted, fontSize: tokens.type.body }}>
            No desks yet. Add your first desk above.
          </div>
        ) : (
          paginated.map((desk, idx) => (
            <div
              key={desk.id}
              style={{
                display: "grid",
                gridTemplateColumns: TABLE_COLS,
                padding: `${tokens.space.s16} ${tokens.space.s24}`,
                borderBottom: idx < paginated.length - 1 ? `1px solid ${tokens.color.border.subtle}` : "none",
                alignItems: "center",
              }}
            >
              {/* Name + icon */}
              <div style={{ display: "flex", alignItems: "center", gap: tokens.space.s12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: tokens.radius.full,
                    background: tokens.color.surface.level2,
                    border: `1px solid ${tokens.color.border.subtle}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: desk.isActive ? tokens.color.text.muted : tokens.color.border.strong,
                    flexShrink: 0,
                    opacity: desk.isActive ? 1 : 0.6,
                  }}
                >
                  <MonitorIcon size={16} />
                </div>
                <div>
                  <p style={{
                    fontSize: tokens.type.body,
                    fontWeight: 500,
                    color: desk.isActive ? tokens.color.text.primary : tokens.color.text.muted,
                    textDecoration: desk.isActive ? "none" : "line-through",
                    margin: 0,
                  }}>
                    {desk.name}
                  </p>
                  <p style={{ fontSize: tokens.type.micro, color: tokens.color.text.muted, margin: 0, opacity: 0.8 }}>
                    {desk.isActive ? "Active" : "Archived"}
                  </p>
                </div>
              </div>

              {/* Status badge — click to toggle */}
              <button
                type="button"
                onClick={() => handleToggleActive(desk)}
                title={desk.isActive ? "Click to archive" : "Click to activate"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: tokens.space.s4,
                  padding: `${tokens.space.s4} ${tokens.space.s12}`,
                  borderRadius: tokens.radius.full,
                  fontSize: tokens.type.micro,
                  fontWeight: 500,
                  background: desk.isActive ? tokens.color.status.successBg : tokens.color.surface.level2,
                  color: desk.isActive ? tokens.color.status.success : tokens.color.text.muted,
                  border: `1px solid ${desk.isActive ? tokens.color.status.successBorder : tokens.color.border.strong}`,
                  cursor: "pointer",
                  width: "fit-content",
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: tokens.radius.full, background: "currentColor", flexShrink: 0 }} />
                {desk.isActive ? "Active" : "Archived"}
              </button>

              {/* QR chip */}
              <div style={{ display: "flex", alignItems: "center", gap: tokens.space.s8, color: desk.qrToken ? tokens.color.text.secondary : tokens.color.text.muted }}>
                <QrCodeIcon size={16} />
                <span style={{ fontSize: tokens.type.caption }}>
                  {desk.qrToken ? "Enabled" : "Not enabled"}
                </span>
              </div>

              {/* Action — edit only (per Figma) */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => { setEditDesk(desk); setEditName(desk.name); setEditError(""); }}
                  title="Edit desk"
                  style={{
                    width: 32, height: 32,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "transparent",
                    border: "none",
                    borderRadius: tokens.radius.r12,
                    color: tokens.color.text.muted,
                    cursor: "pointer",
                  }}
                >
                  <EditIcon size={16} />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Pagination — always visible */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${tokens.space.s16} ${tokens.space.s24}`,
            borderTop: `1px solid ${tokens.color.border.subtle}`,
          }}
        >
          <span style={{ fontSize: tokens.type.caption, color: tokens.color.text.muted }}>
            Showing {totalDesks === 0 ? 0 : page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalDesks)} of {totalDesks} workspace{totalDesks !== 1 ? "s" : ""}
          </span>
          <div style={{ display: "flex", gap: tokens.space.s8 }}>
            <Button variant="secondary" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
              Previous
            </Button>
            <Button variant="secondary" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Add desk modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add new desk" width={440}>
        <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s20 }}>
          <Input
            id="add-desk-name"
            label="Desk name"
            placeholder="e.g. Window Spot 01"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            error={addError}
            maxLength={100}
            autoFocus
          />
          <div style={{ display: "flex", gap: tokens.space.s12, justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAdd}>Add Desk</Button>
          </div>
        </div>
      </Modal>

      {/* Edit desk modal — delete also lives here */}
      <Modal open={!!editDesk} onClose={() => setEditDesk(null)} title="Edit desk" width={440}>
        <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s20 }}>
          <Input
            id="edit-desk-name"
            label="Desk name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEdit()}
            error={editError}
            maxLength={100}
            autoFocus
          />
          <div style={{ display: "flex", gap: tokens.space.s12, justifyContent: "space-between" }}>
            <Button
              variant="secondary"
              icon={<TrashIcon size={14} />}
              onClick={() => { setDeleteTarget(editDesk); setEditDesk(null); }}
              style={{ color: tokens.color.status.error, borderColor: tokens.color.status.error }}
            >
              Delete
            </Button>
            <div style={{ display: "flex", gap: tokens.space.s12 }}>
              <Button variant="secondary" onClick={() => setEditDesk(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleEdit}>Save changes</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete desk" width={440}>
        <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s20 }}>
          <p style={{ fontSize: tokens.type.body, color: tokens.color.text.secondary }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: tokens.color.text.primary }}>{deleteTarget?.name}</strong>?
            This will also remove all reservations for this desk.
          </p>
          <div style={{ display: "flex", gap: tokens.space.s12, justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              style={{ background: tokens.color.status.error }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
