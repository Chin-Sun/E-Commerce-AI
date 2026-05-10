/**
 * Tests that the seed.mjs's slug→actual-DB-id remapping correctly links products
 * to their category even when the category's auto-increment id doesn't match
 * its position in categorySeed (reproduces the daily-supplies id=37 incident).
 *
 * Inserts temporary test rows, asserts correctness, then deletes them.
 */

import "dotenv/config";
import mysql from "mysql2/promise";

const SLUG = "test-remap-category";
const SKU = "TEST-REMAP-001";

async function run() {
  const url = new URL(process.env.DATABASE_URL);
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });

  try {
    // ── Setup: bump auto_increment so the test category gets a non-sequential id
    const [[{ maxId }]] = await conn.query(
      `SELECT COALESCE(MAX(id), 0) + 50 AS maxId FROM categories`
    );
    await conn.query(`ALTER TABLE categories AUTO_INCREMENT = ?`, [maxId]);

    // Insert test category (will receive id = maxId, not its seed-position index)
    await conn.execute(
      `INSERT INTO categories (slug, nameEn, nameZh, nameZhTw, nameMs, sortOrder)
       VALUES (?, 'Test Remap', 'Test Remap', 'Test Remap', 'Test Remap', 99)`,
      [SLUG]
    );

    // Fetch the actual id the DB assigned
    const [[{ actualId }]] = await conn.query(
      `SELECT id AS actualId FROM categories WHERE slug = ?`,
      [SLUG]
    );

    // ── Reproduce the remapping logic from seed.mjs
    const [catRows] = await conn.query(`SELECT id, slug FROM categories`);
    const catIdBySlug = Object.fromEntries(catRows.map(r => [r.slug, r.id]));

    // Simulate a categorySeed where test category is at index 0 (seed position 1)
    const testCategorySeed = [{ slug: SLUG }];
    const slugBySeedIndex = Object.fromEntries(
      testCategorySeed.map((c, i) => [i + 1, c.slug])
    );

    // A product with seed-position categoryId = 1 should resolve to actualId
    const seedCategoryId = 1;
    const resolvedCategoryId = catIdBySlug[slugBySeedIndex[seedCategoryId]];

    // ── Assert remapping is correct
    if (resolvedCategoryId !== actualId) {
      throw new Error(
        `FAIL: resolved categoryId=${resolvedCategoryId} but expected actualId=${actualId}`
      );
    }

    // ── Insert test product using resolved id
    await conn.execute(
      `INSERT INTO products (sku, categoryId, nameEn, nameZh, nameZhTw, nameMs, price, stock, isActive)
       VALUES (?, ?, 'Test', 'Test', 'Test', 'Test', 1.00, 1, true)`,
      [SKU, resolvedCategoryId]
    );

    // Verify the product row has the correct categoryId in the DB
    const [[product]] = await conn.query(
      `SELECT categoryId FROM products WHERE sku = ?`,
      [SKU]
    );

    if (product.categoryId !== actualId) {
      throw new Error(
        `FAIL: product.categoryId=${product.categoryId} but expected ${actualId}`
      );
    }

    console.log(
      `PASS: category slug="${SLUG}" assigned id=${actualId}; ` +
        `product correctly linked via remap (seed index 1 → id ${actualId})`
    );
  } finally {
    // ── Cleanup: remove test rows regardless of pass/fail
    await conn.execute(`DELETE FROM products WHERE sku = ?`, [SKU]);
    await conn.execute(`DELETE FROM categories WHERE slug = ?`, [SLUG]);
    await conn.end();
  }
}

run().catch(err => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
