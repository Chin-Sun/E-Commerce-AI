import * as db from "../db/db";
import type { ProductSearchAdapter, ProductSearchQuery, ProductSummary } from "./types";

function toSummary(p: {
  id: number;
  nameEn: string;
  nameZh: string;
  price: string | number;
  currency: string | null;
  stock: number;
  images: unknown;
  specs: unknown;
  categoryId: number | null;
}): ProductSummary {
  const rawImages = p.images;
  const images: string[] = Array.isArray(rawImages)
    ? (rawImages as string[])
    : typeof rawImages === "string"
      ? JSON.parse(rawImages)
      : [];

  const rawSpecs = p.specs;
  const specs: Record<string, string> =
    rawSpecs && typeof rawSpecs === "object" && !Array.isArray(rawSpecs)
      ? (rawSpecs as Record<string, string>)
      : typeof rawSpecs === "string"
        ? JSON.parse(rawSpecs)
        : {};

  return {
    id: p.id,
    nameEn: p.nameEn,
    nameZh: p.nameZh,
    price: String(p.price),
    currency: p.currency ?? "USD",
    stock: p.stock,
    images,
    specs,
    categoryId: p.categoryId ?? 0,
  };
}

export class LocalDbAdapter implements ProductSearchAdapter {
  async search(q: ProductSearchQuery): Promise<ProductSummary[]> {
    const { items } = await db.listProducts({
      search: q.keyword,
      categoryId: q.categoryId,
      minPrice: q.minPrice,
      maxPrice: q.maxPrice,
      limit: q.limit ?? 6,
      isActive: true,
    });
    return items.map(toSummary);
  }

  async getById(id: number): Promise<ProductSummary | null> {
    const p = await db.getProductById(id);
    return p ? toSummary(p) : null;
  }
}

// Single shared instance — swap for AlibabaAdapter, AmazonAdapter, etc.
export const defaultAdapter: ProductSearchAdapter = new LocalDbAdapter();
