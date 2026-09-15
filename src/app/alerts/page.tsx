import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dev-user";
export const dynamic = "force-dynamic";

export default async function Alerts() {
  const user = await getCurrentUser();
  const alerts = await prisma.alert.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return <main className="shell py-10"><div className="flex items-center justify-between"><div><p className="eyebrow">Monitoramento</p><h1 className="mt-2 text-3xl font-bold">Meus alertas</h1></div><Link className="button" href="/alerts/new">Novo alerta</Link></div>{alerts.length === 0 ? <div className="card mt-8 text-center"><h2 className="font-bold">Nenhum alerta cadastrado</h2><p className="mt-2 text-sm text-slate-600">Crie seu primeiro alerta para começar a monitorar uma rota.</p><Link className="button mt-4" href="/alerts/new">Criar alerta</Link></div> : <div className="card mt-8 overflow-x-auto p-0"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50 text-slate-500"><tr><th className="p-4">Origem</th><th className="p-4">Destinos</th><th className="p-4">Status</th><th className="p-4"></th></tr></thead><tbody>{alerts.map((alert) => <tr className="border-b last:border-0" key={alert.id}><td className="p-4 font-semibold">{alert.origin}</td><td className="p-4">{alert.anyDestination ? "Qualquer destino" : alert.destinations.join(", ")}</td><td className="p-4"><span className={alert.status === "ACTIVE" ? "text-emerald-700" : "text-slate-500"}>{alert.status === "ACTIVE" ? "Ativo" : "Pausado"}</span></td><td className="p-4"><Link className="font-semibold text-blue-600" href={`/alerts/${alert.id}`}>Ver</Link></td></tr>)}</tbody></table></div>}</main>;
}
