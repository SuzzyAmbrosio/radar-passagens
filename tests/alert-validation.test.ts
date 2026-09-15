import { describe, expect, it } from "vitest"; import { alertSchema } from "@/lib/validation";
const valid = { origin: "FOR", destinations: ["LIS"], dateMode: "RANGE", adults: 1, currency: "BRL" };
describe("criação de alerta", () => { it("aceita um alerta válido", () => expect(alertSchema.safeParse(valid).success).toBe(true)); it("rejeita preço máximo inválido", () => expect(alertSchema.safeParse({ ...valid, maxPrice: 0 }).success).toBe(false)); });
