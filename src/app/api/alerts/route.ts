import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dev-user";
import { Prisma } from "@prisma/client";
import { alertSchema } from "@/lib/validation";
export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json(await prisma.alert.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }));
  } catch (error) {
    console.error("Falha ao listar alertas", error);
    return NextResponse.json({ error: "Não foi possível listar os alertas" }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const parsed = alertSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });
    const data = parsed.data;
    const alert = await prisma.alert.create({ data: { ...data, userId: user.id, status: "ACTIVE", maxStops: data.maxStops ?? null, nextCheckAt: null } });
    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) return NextResponse.json({ error: "Não foi possível criar o alerta" }, { status: 409 });
    console.error("Falha ao criar alerta", error);
    return NextResponse.json({ error: "Não foi possível criar o alerta" }, { status: 500 });
  }
}
