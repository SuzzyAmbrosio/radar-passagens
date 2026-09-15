import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dev-user";
import { alertStatusSchema } from "@/lib/validation";

/** Compatibility route; PATCH /api/alerts/:id is the primary status endpoint. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || id.length > 64) return NextResponse.json({ error: "ID de alerta inválido" }, { status: 400 });
  const body = await request.json().catch(() => ({ status: "PAUSED" }));
  const parsed = alertStatusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const user = await getCurrentUser();
  const alert = await prisma.alert.findFirst({ where: { id, userId: user.id } });
  if (!alert) return NextResponse.json({ error: "Alerta não encontrado" }, { status: 404 });
  return NextResponse.json(await prisma.alert.update({ where: { id }, data: { status: parsed.data.status } }));
}
