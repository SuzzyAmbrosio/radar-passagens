export type DealEvaluation = { isDeal: boolean; reason?: "MAX_PRICE" | "HISTORICAL_DROP"; savings?: number };
export class DealDetector {
  evaluate(price: number, maxPrice?: number | null, historicalAverage?: number | null): DealEvaluation {
    if (maxPrice != null && price <= maxPrice) return { isDeal: true, reason: "MAX_PRICE", savings: maxPrice - price };
    if (historicalAverage != null && price <= historicalAverage * 0.85) return { isDeal: true, reason: "HISTORICAL_DROP", savings: historicalAverage - price };
    return { isDeal: false };
  }
}
