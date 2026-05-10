import type { ComparisonResult, ProductSummary, SpecDiff } from "./types";

type PartialComparison = Omit<ComparisonResult, "recommendation">;

export class CompareService {
  /** Pure structural diff — no LLM call */
  diff(products: ProductSummary[]): PartialComparison {
    const allKeys = Array.from(new Set(products.flatMap(p => Object.keys(p.specs))));

    const specDiffs: SpecDiff[] = allKeys.map(key => {
      const values: Record<number, string | undefined> = Object.fromEntries(
        products.map(p => [p.id, p.specs[key]])
      );
      return {
        key,
        values,
        hasDifference: new Set(Object.values(values)).size > 1,
      };
    });

    const prices = products.map(p => Number(p.price));
    return {
      products,
      specDiffs,
      priceRange: {
        min: Math.min(...prices).toFixed(2),
        max: Math.max(...prices).toFixed(2),
        currency: products[0]?.currency ?? "USD",
      },
    };
  }

  /** Human-readable 1-line summary of key differences (used in AgentRound.comparison) */
  summarize(partial: PartialComparison): string {
    const diffKeys = partial.specDiffs
      .filter(d => d.hasDifference)
      .map(d => d.key);
    if (!diffKeys.length) return "Products are identical across all compared specs.";
    return `Key differences: ${diffKeys.slice(0, 4).join(", ")}.`;
  }
}

export const compareService = new CompareService();
