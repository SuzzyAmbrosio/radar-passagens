import type { FlightDataProvider, FlightOfferData, FlightSearchInput } from "./types";

/** Development-only provider. It never performs network calls and its data is not real. */
export class MockFlightDataProvider implements FlightDataProvider {
  readonly name = "MOCK_PROVIDER";
  async search(input: FlightSearchInput): Promise<FlightOfferData[]> {
    const departureDate = input.departureDate ?? new Date("2026-11-10T12:00:00Z");
    const returnDate = input.returnDate ?? new Date("2026-11-17T12:00:00Z");
    return input.destinations.slice(0, 3).map((destination, index) => ({
      provider: this.name, origin: input.origin, destination, departureDate, returnDate,
      airline: "Companhia Exemplo", stops: index, durationMinutes: 180 + index * 55,
      price: 850 + index * 175, currency: input.currency,
      offerUrl: "https://example.invalid/mock-offer", foundAt: new Date(), isMock: true,
    }));
  }
}
