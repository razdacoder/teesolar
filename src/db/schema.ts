import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	real,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth-schema";

export * from "./auth-schema";

// Categories live in code (src/data/products.ts) because icons and copy are keyed by id;
// the enum keeps the database in step with them.
export const categoryEnum = pgEnum("category", [
	"solar-generators",
	"inverters",
	"batteries",
	"panels",
	"packages",
]);

export const conditionEnum = pgEnum("condition", ["new", "fairly used"]);

export const stockReasonEnum = pgEnum("stock_reason", [
	"restock",
	"sale",
	"adjustment",
	"return",
]);

export const products = pgTable("products", {
	id: uuid().primaryKey().defaultRandom(),
	slug: text().notNull().unique(),
	name: text().notNull(),
	brand: text(),
	category: categoryEnum().notNull(),
	summary: text().notNull(),
	highlights: text().array().notNull().default([]),
	/** Naira. Null means "ask on WhatsApp". */
	price: integer(),
	oldPrice: integer(),
	featured: boolean().notNull().default(false),
	/** Hidden products stay in the admin (and keep their stock history) but leave the shop. */
	published: boolean().notNull().default(true),
	condition: conditionEnum().notNull().default("new"),
	/** Continuous output in watts, used by the load calculator to suggest products. */
	output: integer(),
	/** Usable battery storage in kWh, when known. */
	storage: real(),
	/** Image URLs, main photo first. Products without any show a branded tile. */
	images: text().array().notNull().default([]),
	/** TikTok video id where this item is shown. */
	video: text(),
	/** Units on hand. Only change it through a stock movement so the ledger stays accurate. */
	stock: integer().notNull().default(0),
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const stockMovements = pgTable(
	"stock_movements",
	{
		id: uuid().primaryKey().defaultRandom(),
		productId: uuid()
			.notNull()
			.references(() => products.id, { onDelete: "cascade" }),
		/** Positive adds stock, negative removes it. */
		quantity: integer().notNull(),
		reason: stockReasonEnum().notNull(),
		note: text(),
		createdBy: text().references(() => user.id, { onDelete: "set null" }),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [index("stock_movements_product_idx").on(t.productId)],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type StockMovement = typeof stockMovements.$inferSelect;

export const productSelectSchema = createSelectSchema(products);

const slug = z
	.string()
	.trim()
	.min(1)
	.regex(
		/^[a-z0-9]+(-[a-z0-9]+)*$/,
		"Use lowercase letters, numbers and dashes",
	);

export const productInsertSchema = createInsertSchema(products, {
	slug,
	name: (s) => s.trim().min(1, "Required"),
	summary: (s) => s.trim().min(1, "Required"),
	price: (s) => s.int().nonnegative(),
	oldPrice: (s) => s.int().nonnegative(),
	output: (s) => s.int().positive(),
	storage: (s) => s.positive(),
	images: z
		.array(
			z
				.string()
				.refine(
					(src) => src.startsWith("https://") || src.startsWith("/"),
					"Images must be uploaded or a /public path",
				),
		)
		.max(12, "Up to 12 photos"),
}).omit({ id: true, stock: true, createdAt: true, updatedAt: true });

export const productUpdateSchema = productInsertSchema.partial().extend({
	id: z.uuid(),
});

export const stockMovementInsertSchema = createInsertSchema(stockMovements, {
	quantity: (s) => s.int().refine((n) => n !== 0, "Quantity can't be zero"),
}).omit({ id: true, createdAt: true, createdBy: true });
