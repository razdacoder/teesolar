// Loads the starter catalog. Run with `pnpm db:seed`. Existing products (matched by slug)
// are left alone, so it's safe to re-run after adding products from the admin page.
import { catalog, seedProducts } from "./catalog";
import { db } from "./index";

const count = await seedProducts();
console.log(`Seeded ${count} of ${catalog.length} products.`);
await db.$client.end();
