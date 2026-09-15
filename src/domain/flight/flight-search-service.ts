import type { FlightDataProvider, FlightOfferData, FlightSearchInput } from "./types";

export class FlightSearchService {
  constructor(private readonly providers: FlightDataProvider[]) {}
  async search(input: FlightSearchInput): Promise<FlightOfferData[]> {
    const results = await Promise.all(this.providers.map((provider) => provider.search(input)));
    return results.flat().map((offer) => ({ ...offer, price: Number(offer.price.toFixed(2)) }));
  }
}
