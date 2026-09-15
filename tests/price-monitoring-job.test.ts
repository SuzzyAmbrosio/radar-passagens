import { describe, expect, it, vi } from "vitest";
import { FlightSearchService } from "@/domain/flight/flight-search-service";
import type { FlightDataProvider } from "@/domain/flight/types";
import { PriceAnalyzer } from "@/domain/pricing/price-analyzer";
import { PriceMonitoringJob } from "@/jobs/price-monitoring-job";

const now = new Date("2026-09-15T12:00:00Z");
const activeAlert = { id: "alert-1", origin: "JPA", destinations: ["GRU"], startDate: null, endDate: null, adults: 1, children: 0, infants: 0, maxStops: null, currency: "BRL", maxPrice: { toNumber: () => 600 }, frequency: "DAILY" };
function provider(search = vi.fn()) { return { name: "TEST_PROVIDER", search } satisfies FlightDataProvider; }
function database(alerts = [activeAlert]) {
  let searchNumber = 0;
  return {
    alert: { findMany: vi.fn().mockResolvedValue(alerts), update: vi.fn().mockResolvedValue({}) },
    flightSearch: { create: vi.fn().mockImplementation(async () => ({ id: `search-${++searchNumber}` })), update: vi.fn().mockResolvedValue({}) },
    flightOffer: { create: vi.fn().mockResolvedValue({}) },
    priceHistory: { findMany: vi.fn().mockResolvedValue([]) },
  };
}
const offer = { provider: "TEST_PROVIDER", origin: "JPA", destination: "GRU", departureDate: now, returnDate: undefined, airline: "Exemplo", stops: 0, durationMinutes: 120, price: 450, currency: "BRL", offerUrl: "https://example.invalid/mock", foundAt: now, isMock: true };

describe("PriceMonitoringJob", () => {
  it("seleciona apenas alertas ativos elegíveis", async () => { const db = database([]); const job = new PriceMonitoringJob(db as never, new FlightSearchService([provider()])); await job.run(now); expect(db.alert.findMany).toHaveBeenCalledWith({ where: { status: "ACTIVE", OR: [{ nextCheckAt: null }, { nextCheckAt: { lte: now } }] } }); });
  it("não processa alertas pausados ou com próxima verificação futura quando a consulta não os retorna", async () => { const db = database([]); const job = new PriceMonitoringJob(db as never, new FlightSearchService([provider()])); const result = await job.run(now); expect(result.processed).toBe(0); expect(db.flightSearch.create).not.toHaveBeenCalled(); });
  it("cria a busca, persiste a oferta e o histórico", async () => { const db = database(); const job = new PriceMonitoringJob(db as never, new FlightSearchService([provider(vi.fn().mockResolvedValue([offer]))])); const result = await job.run(now); expect(result).toMatchObject({ processed: 1, searches: 1, offers: 1, deals: 1 }); expect(db.flightSearch.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ alertId: "alert-1", status: "RUNNING" }) })); expect(db.flightOffer.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ alertId: "alert-1", searchId: "search-1", priceHistory: { create: expect.objectContaining({ alertId: "alert-1", price: 450 }) } }) })); });
  it("atualiza a próxima verificação após sucesso", async () => { const db = database(); const job = new PriceMonitoringJob(db as never, new FlightSearchService([provider(vi.fn().mockResolvedValue([]))])); await job.run(now); expect(db.alert.update).toHaveBeenCalledWith({ where: { id: "alert-1" }, data: { lastCheckedAt: now, nextCheckAt: new Date("2026-09-16T12:00:00Z") } }); });
  it("marca uma busca como falha e continua com os demais alertas", async () => { const second = { ...activeAlert, id: "alert-2", origin: "REC" }; const db = database([{ ...activeAlert, origin: "ERR" }, second]); const search = vi.fn().mockImplementation(async (input) => { if (input.origin === "ERR") throw new Error("provider failed"); return [offer]; }); const job = new PriceMonitoringJob(db as never, new FlightSearchService([provider(search)])); const result = await job.run(now); expect(result).toMatchObject({ processed: 1, failed: 1 }); expect(db.flightSearch.update).toHaveBeenCalledWith({ where: { id: "search-1" }, data: { status: "FAILED" } }); expect(db.flightOffer.create).toHaveBeenCalledTimes(1); });
  it("não cria sinal histórico quando há menos de três preços anteriores", () => { const analysis = new PriceAnalyzer().analyze(450, null, [{ price: 1000, capturedAt: now }, { price: 900, capturedAt: now }]); expect(analysis.historySufficient).toBe(false); expect(analysis.historicalAverage).toBeNull(); });
});
