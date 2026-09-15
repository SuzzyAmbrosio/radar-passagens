import { NextResponse } from "next/server";
import { MockFlightDataProvider } from "@/domain/flight/mock-flight-data-provider";
import { FlightSearchService } from "@/domain/flight/flight-search-service";
import { PriceMonitoringJob } from "@/jobs/price-monitoring-job";
import { prisma } from "@/lib/prisma";

/** Development/MVP manual trigger only. It intentionally has no authentication until the real auth layer exists. */
export async function POST() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Trigger manual disponível somente em desenvolvimento" }, { status: 403 });
  try {
    const job = new PriceMonitoringJob(prisma, new FlightSearchService([new MockFlightDataProvider()]));
    return NextResponse.json(await job.run());
  } catch (error) {
    console.error("Falha ao executar monitoramento manual", error);
    return NextResponse.json({ error: "Não foi possível executar o monitoramento" }, { status: 500 });
  }
}
