// Runs once when the server starts (see src/server.ts): applies pending migrations, loads
// the starter catalog into an empty store and creates the first admin from env vars.
import { count, eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { auth } from "#/lib/auth";
import { catalog, seedProducts } from "./catalog";
import { db } from "./index";
import { products, user } from "./schema";

async function seedCatalog() {
	// Only into an empty table, so products deleted from the admin don't come back on restart.
	const [{ total }] = await db.select({ total: count() }).from(products);
	if (total > 0) return;
	const seeded = await seedProducts();
	console.log(`[bootstrap] Seeded ${seeded} of ${catalog.length} products.`);
}

async function seedAdmin() {
	const [admin] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.role, "admin"))
		.limit(1);
	if (admin) return;

	const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
	const password = process.env.ADMIN_PASSWORD;
	if (!email || !password) {
		console.warn(
			"[bootstrap] No admin account yet. Set ADMIN_EMAIL and ADMIN_PASSWORD, or run `pnpm admin:invite you@example.com`.",
		);
		return;
	}

	const [existing] = await db
		.select({ role: user.role })
		.from(user)
		.where(eq(user.email, email));
	if (existing) {
		console.warn(
			`[bootstrap] ${email} already has an account (role: ${existing.role}), so no admin was created.`,
		);
		return;
	}

	// Called without headers, createUser runs as the server rather than as a user.
	await auth.api.createUser({
		body: {
			email,
			password,
			name: process.env.ADMIN_NAME?.trim() || "Admin",
			role: "admin",
		},
	});
	console.log(`[bootstrap] Created admin account ${email}.`);
}

async function run() {
	// Vercel functions don't ship the drizzle/ folder, so there `vercel-build` migrates instead.
	if (!process.env.VERCEL) {
		await migrate(db, { migrationsFolder: "drizzle" });
	}
	await seedCatalog();
	await seedAdmin();
}

// Vite re-imports the server entry on edits in dev; run once per process.
const globalForBootstrap = globalThis as unknown as {
	bootstrap?: Promise<void>;
};

export function bootstrap() {
	globalForBootstrap.bootstrap ??= run().catch((error) => {
		// Let the next attempt retry, e.g. once the database is reachable.
		globalForBootstrap.bootstrap = undefined;
		throw error;
	});
	return globalForBootstrap.bootstrap;
}
