import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => ({ prisma: { alert: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } } }));
const alert = { id: "alert-1", userId: "user-1", origin: "FOR", destinations: ["LIS"], status: "ACTIVE" };
vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/dev-user", () => ({ getCurrentUser: vi.fn(async () => ({ id: "user-1" })) }));

import { GET as listAlerts, POST as createAlert } from "@/app/api/alerts/route";
import { GET as getAlert, PATCH as updateAlert } from "@/app/api/alerts/[id]/route";

const context = (id = "alert-1") => ({ params: Promise.resolve({ id }) });
const validInput = { origin: "FOR", destinations: ["LIS"], dateMode: "RANGE", adults: 1, currency: "BRL" };

describe("API de alertas", () => {
  beforeEach(() => vi.clearAllMocks());
  it("cria um alerta validado para o usuário atual", async () => { prisma.alert.create.mockResolvedValue(alert); const response = await createAlert(new Request("http://test/api/alerts", { method: "POST", body: JSON.stringify(validInput) })); expect(response.status).toBe(201); expect(prisma.alert.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: "user-1", status: "ACTIVE", nextCheckAt: null }) })); });
  it("lista apenas alertas do usuário atual", async () => { prisma.alert.findMany.mockResolvedValue([alert]); const response = await listAlerts(); expect(response.status).toBe(200); expect(prisma.alert.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "user-1" } })); });
  it("retorna um alerta pelo ID quando pertence ao usuário", async () => { prisma.alert.findFirst.mockResolvedValue(alert); const response = await getAlert(new Request("http://test"), context()); expect(response.status).toBe(200); });
  it("não permite acessar alerta de outro usuário", async () => { prisma.alert.findFirst.mockResolvedValue(null); const response = await getAlert(new Request("http://test"), context()); expect(response.status).toBe(404); });
  it("persiste a alteração de status", async () => { prisma.alert.findFirst.mockResolvedValue(alert); prisma.alert.update.mockResolvedValue({ ...alert, status: "PAUSED" }); const response = await updateAlert(new Request("http://test", { method: "PATCH", body: JSON.stringify({ status: "PAUSED" }) }), context()); expect(response.status).toBe(200); expect(prisma.alert.update).toHaveBeenCalledWith({ where: { id: "alert-1" }, data: { status: "PAUSED" } }); });
  it("rejeita dados inválidos", async () => { const response = await createAlert(new Request("http://test", { method: "POST", body: JSON.stringify({ ...validInput, maxPrice: 0 }) })); expect(response.status).toBe(400); });
});
