"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AlertStatusToggle({ id, status }: { id: string; status: "ACTIVE" | "PAUSED" }) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const nextStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";

  async function updateStatus() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/alerts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      if (!response.ok) throw new Error("status");
      const alert = await response.json();
      setCurrentStatus(alert.status);
      router.refresh();
    } catch {
      setError("Não foi possível atualizar o alerta.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="text-right"><button type="button" onClick={updateStatus} disabled={loading} className={currentStatus === "ACTIVE" ? "button-secondary text-sm" : "button text-sm"}>{loading ? "Atualizando…" : currentStatus === "ACTIVE" ? "Pausar alerta" : "Ativar alerta"}</button>{error && <p className="mt-2 text-xs text-red-600">{error}</p>}</div>;
}
