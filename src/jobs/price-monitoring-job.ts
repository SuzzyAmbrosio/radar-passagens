import { AlertStatus, MonitoringFrequency, PrismaClient } from "@prisma/client";
import { DealDetector } from "@/domain/deals/deal-detector";
import { FlightSearchService } from "@/domain/flight/flight-search-service";
import { PriceAnalyzer } from "@/domain/pricing/price-analyzer";

type MonitorAlert = { id: string; origin: string; destinations: string[]; startDate: Date | null; endDate: Date | null; adults: number; children: number; infants: number; maxStops: number | null; currency: string; maxPrice: { toNumber(): number } | null; frequency: MonitoringFrequency };
type MonitoringClient = Pick<PrismaClient, "alert" | "flightSearch" | "flightOffer" | "priceHistory">;
export type MonitoringRunResult = { processed: number; failed: number; searches: number; offers: number; deals: number };

/** Scheduler-agnostic monitoring engine. A scheduler may call run() later; it has no timer of its own. */
export class PriceMonitoringJob {
  constructor(
    private readonly db: MonitoringClient,
    private readonly flightSearch: FlightSearchService,
    private readonly priceAnalyzer = new PriceAnalyzer(),
    private readonly dealDetector = new DealDetector(),
  ) {}

  async run(now = new Date()): Promise<MonitoringRunResult> {
    const alerts = await this.db.alert.findMany({ where: { status: AlertStatus.ACTIVE, OR: [{ nextCheckAt: null }, { nextCheckAt: { lte: now } }] } }) as MonitorAlert[];
    const result: MonitoringRunResult = { processed: 0, failed: 0, searches: 0, offers: 0, deals: 0 };
    for (const alert of alerts) {
      try {
        const outcome = await this.processAlert(alert, now);
        result.processed += 1;
        result.searches += 1;
        result.offers += outcome.offers;
        result.deals += outcome.deals;
      } catch (error) {
        result.failed += 1;
        console.error(`Falha no monitoramento do alerta ${alert.id}`, error);
      }
    }
    return result;
  }

  private async processAlert(alert: MonitorAlert, now: Date) {
    const search = await this.db.flightSearch.create({ data: { alertId: alert.id, provider: "MOCK_PROVIDER", status: "RUNNING", searchedAt: now } });
    try {
      const offers = await this.flightSearch.search({ origin: alert.origin, destinations: alert.destinations, departureDate: alert.startDate ?? undefined, returnDate: alert.endDate ?? undefined, adults: alert.adults, children: alert.children, infants: alert.infants, maxStops: alert.maxStops, currency: alert.currency });
      let deals = 0;
      for (const offer of offers) {
        const history = await this.db.priceHistory.findMany({ where: { alertId: alert.id }, orderBy: { capturedAt: "desc" }, take: 30, select: { price: true, capturedAt: true } });
        const analysis = this.priceAnalyzer.analyze(offer.price, alert.maxPrice?.toNumber(), history.map((item) => ({ price: Number(item.price), capturedAt: item.capturedAt })));
        const deal = this.dealDetector.evaluate(offer.price, analysis.maxPrice, analysis.historicalAverage);
        if (deal.isDeal) deals += 1;
        await this.db.flightOffer.create({ data: { alertId: alert.id, searchId: search.id, provider: offer.provider, origin: offer.origin, destination: offer.destination, departureDate: offer.departureDate, returnDate: offer.returnDate, airline: offer.airline, stops: offer.stops, durationMinutes: offer.durationMinutes, price: offer.price, currency: offer.currency, offerUrl: offer.offerUrl, foundAt: offer.foundAt, isMock: offer.isMock, priceHistory: { create: { alertId: alert.id, price: offer.price, currency: offer.currency, capturedAt: offer.foundAt, isMock: offer.isMock } } } });
      }
      await this.db.flightSearch.update({ where: { id: search.id }, data: { status: "SUCCESS" } });
      await this.db.alert.update({ where: { id: alert.id }, data: { lastCheckedAt: now, nextCheckAt: this.nextCheckAt(alert.frequency, now) } });
      return { offers: offers.length, deals };
    } catch (error) {
      await this.db.flightSearch.update({ where: { id: search.id }, data: { status: "FAILED" } });
      throw error;
    }
  }

  /** DAILY = 24 h, WEEKLY = 7 days, CUSTOM currently uses a documented MVP fallback of 60 minutes. */
  private nextCheckAt(frequency: MonitoringFrequency, now: Date) {
    const milliseconds = frequency === "WEEKLY" ? 7 * 24 * 60 * 60 * 1000 : frequency === "CUSTOM" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    return new Date(now.getTime() + milliseconds);
  }
}
