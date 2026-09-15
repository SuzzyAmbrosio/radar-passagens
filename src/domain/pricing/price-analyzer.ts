export type PriceSnapshot = { price: number; capturedAt: Date };
export class PriceAnalyzer {
  summarize(history: PriceSnapshot[]) {
    if (!history.length) return { average: null, minimum: null, current: null, changeFromAverage: null };
    const prices = history.map((item) => item.price);
    const current = history.at(-1)!.price;
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    return { average, minimum: Math.min(...prices), current, changeFromAverage: current - average };
  }

  analyze(currentPrice: number, maxPrice: number | null | undefined, history: PriceSnapshot[]) {
    const summary = this.summarize(history);
    const historySufficient = history.length >= 3;
    return {
      currentPrice,
      maxPrice: maxPrice ?? null,
      historySufficient,
      historicalAverage: historySufficient ? summary.average : null,
      historicalMinimum: historySufficient ? summary.minimum : null,
    };
  }
}
