export type FlightSearchInput = {
  origin: string; destinations: string[]; departureDate?: Date; returnDate?: Date;
  adults: number; children?: number; infants?: number; maxStops?: number | null; currency: string;
};
export type FlightOfferData = {
  provider: string; origin: string; destination: string; departureDate: Date; returnDate?: Date;
  airline?: string; stops: number; durationMinutes: number; price: number; currency: string;
  offerUrl: string; foundAt: Date; isMock: boolean;
};
export interface FlightDataProvider {
  readonly name: string;
  search(input: FlightSearchInput): Promise<FlightOfferData[]>;
}
