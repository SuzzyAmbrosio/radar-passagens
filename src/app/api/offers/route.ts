import { NextResponse } from "next/server";
import { MockFlightDataProvider } from "@/domain/flight/mock-flight-data-provider";
import { FlightSearchService } from "@/domain/flight/flight-search-service";
export async function GET() { const offers = await new FlightSearchService([new MockFlightDataProvider()]).search({ origin: "FOR", destinations: ["GRU", "LIS", "MIA"], adults: 1, currency: "BRL" }); return NextResponse.json({ dataSource: "MOCK — somente desenvolvimento; não são preços reais.", offers }); }
