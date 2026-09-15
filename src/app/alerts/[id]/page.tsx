import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dev-user";
import { AlertStatusToggle } from "@/components/alert-status-toggle";
export const dynamic = "force-dynamic";
const date = (value: Date | null) => value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(value) : "Não definido";

export default async function AlertDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || id.length > 64) notFound();
  const user = await getCurrentUser();
  const alert = await prisma.alert.findFirst({ where: { id, userId: user.id } });
  if (!alert) notFound();
  const budget = alert.maxPrice ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: alert.currency }).format(Number(alert.maxPrice)) : "Não definido";
  const stops = alert.maxStops === null ? "Qualquer quantidade" : alert.maxStops === 0 ? "Direto" : `Até ${alert.maxStops} escala${alert.maxStops === 1 ? "" : "s"}`;
  return <main className="shell max-w-4xl py-10"><Link href="/alerts" className="text-sm font-semibold text-blue-600">← Todos os alertas</Link><div className="mt-5 flex items-start justify-between gap-4"><div><p className="eyebrow">Alerta</p><h1 className="mt-2 text-3xl font-bold">{alert.origin} → {alert.anyDestination ? "Qualquer destino" : alert.destinations.join(", ")}</h1><p className="mt-2 text-slate-600">Monitoramento {alert.frequency === "DAILY" ? "diário" : alert.frequency === "WEEKLY" ? "semanal" : "personalizado"}</p></div><AlertStatusToggle id={alert.id} status={alert.status} /></div><section className="card mt-7 grid gap-5 sm:grid-cols-2"><div><p className="text-sm text-slate-500">Datas</p><p className="font-semibold">{date(alert.startDate)} até {date(alert.endDate)}{alert.flexibleDates ? " · flexíveis" : ""}</p></div><div><p className="text-sm text-slate-500">Orçamento</p><p className="font-semibold">{budget}</p></div><div><p className="text-sm text-slate-500">Duração</p><p className="font-semibold">{alert.minDurationDays ?? "—"} a {alert.maxDurationDays ?? "—"} dias</p></div><div><p className="text-sm text-slate-500">Escalas</p><p className="font-semibold">{stops}</p></div><div><p className="text-sm text-slate-500">Passageiros</p><p className="font-semibold">{alert.adults} adulto(s), {alert.children} criança(s), {alert.infants} bebê(s)</p></div><div><p className="text-sm text-slate-500">Companhias</p><p className="font-semibold">{alert.airlines.length ? alert.airlines.join(", ") : "Todas"}</p></div></section></main>;
}
