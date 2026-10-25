import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
	and,
	arrayOverlaps,
	asc,
	count,
	desc,
	eq,
	lte,
	type SQL,
	sql,
	sum,
} from "drizzle-orm";
import { z } from "zod";
import { LOW_STOCK } from "#/data/products";
import { db } from "#/db";
import {
	productInsertSchema,
	products,
	productUpdateSchema,
	stockMovementInsertSchema,
	stockMovements,
	stockReasonEnum,
	user,
} from "#/db/schema";
import { requirePermission } from "./auth";
import {
	cloudinaryConfig,
	destroyImages,
	sign,
	UPLOAD_FOLDER,
} from "./cloudinary";

const catalogOrder = [asc(products.category), asc(products.createdAt)];

// Public

export const listProducts = createServerFn({ method: "GET" }).handler(() =>
	db
		.select()
		.from(products)
		.where(eq(products.published, true))
		.orderBy(...catalogOrder),
);

export const getProductBySlug = createServerFn({ method: "GET" })
	.validator(z.object({ slug: z.string() }))
	.handler(async ({ data }) => {
		const [product] = await db
			.select()
			.from(products)
			.where(and(eq(products.slug, data.slug), eq(products.published, true)));
		if (!product) throw notFound();
		return product;
	});

// Admin reads

export const listAdminProducts = createServerFn({ method: "GET" })
	.middleware([requirePermission()])
	.handler(() =>
		db
			.select()
			.from(products)
			.orderBy(...catalogOrder),
	);

export const getProductById = createServerFn({ method: "GET" })
	.middleware([requirePermission()])
	.validator(z.object({ id: z.uuid() }))
	.handler(async ({ data }) => {
		const [product] = await db
			.select()
			.from(products)
			.where(eq(products.id, data.id));
		if (!product) throw notFound();
		return product;
	});

export const ledgerFilterSchema = z.object({
	productId: z.uuid().optional(),
	reason: z.enum(stockReasonEnum.enumValues).optional(),
	page: z.int().positive().default(1),
});
export type LedgerFilter = z.input<typeof ledgerFilterSchema>;

const LEDGER_PAGE_SIZE = 50;

export const listStockMovements = createServerFn({ method: "GET" })
	.middleware([requirePermission()])
	.validator(ledgerFilterSchema)
	.handler(async ({ data }) => {
		const filters: SQL[] = [];
		if (data.productId)
			filters.push(eq(stockMovements.productId, data.productId));
		if (data.reason) filters.push(eq(stockMovements.reason, data.reason));
		const where = filters.length ? and(...filters) : undefined;

		const [rows, [{ total }]] = await Promise.all([
			db
				.select({
					id: stockMovements.id,
					quantity: stockMovements.quantity,
					reason: stockMovements.reason,
					note: stockMovements.note,
					createdAt: stockMovements.createdAt,
					productId: products.id,
					productName: products.name,
					userName: user.name,
				})
				.from(stockMovements)
				.innerJoin(products, eq(products.id, stockMovements.productId))
				.leftJoin(user, eq(user.id, stockMovements.createdBy))
				.where(where)
				.orderBy(desc(stockMovements.createdAt))
				.limit(LEDGER_PAGE_SIZE)
				.offset((data.page - 1) * LEDGER_PAGE_SIZE),
			db.select({ total: count() }).from(stockMovements).where(where),
		]);
		return {
			rows,
			total,
			pages: Math.max(1, Math.ceil(total / LEDGER_PAGE_SIZE)),
		};
	});

export const getDashboard = createServerFn({ method: "GET" })
	.middleware([requirePermission()])
	.handler(async () => {
		const [[totals], low, recent, [sold]] = await Promise.all([
			db
				.select({
					products: count(),
					units: sum(products.stock).mapWith(Number),
					outOfStock: count(sql`case when ${products.stock} = 0 then 1 end`),
					hidden: count(sql`case when not ${products.published} then 1 end`),
					// Only priced items count; "ask for price" stock has no fixed value.
					value: sum(
						sql`${products.stock}::bigint * ${products.price}`,
					).mapWith(Number),
				})
				.from(products),
			db
				.select()
				.from(products)
				.where(lte(products.stock, LOW_STOCK))
				.orderBy(asc(products.stock), asc(products.name))
				.limit(8),
			db
				.select({
					id: stockMovements.id,
					quantity: stockMovements.quantity,
					reason: stockMovements.reason,
					createdAt: stockMovements.createdAt,
					productId: products.id,
					productName: products.name,
					userName: user.name,
				})
				.from(stockMovements)
				.innerJoin(products, eq(products.id, stockMovements.productId))
				.leftJoin(user, eq(user.id, stockMovements.createdBy))
				.orderBy(desc(stockMovements.createdAt))
				.limit(8),
			db
				.select({
					units: sum(sql`-${stockMovements.quantity}`).mapWith(Number),
				})
				.from(stockMovements)
				.where(
					and(
						eq(stockMovements.reason, "sale"),
						sql`${stockMovements.createdAt} > now() - interval '30 days'`,
					),
				),
		]);
		return {
			...totals,
			units: totals.units ?? 0,
			value: totals.value ?? 0,
			soldLast30Days: sold.units ?? 0,
			low,
			recent,
		};
	});

// Admin writes

/** Turns a slug clash into a message people can act on. */
function slugTaken(slug: string | undefined) {
	return (error: unknown): never => {
		// 23505 is Postgres' unique violation; slug is the only unique column.
		if ((error as { cause?: { code?: string } })?.cause?.code === "23505") {
			throw new Error(`A product with the slug "${slug}" already exists.`);
		}
		throw error;
	};
}

export const createProduct = createServerFn({ method: "POST" })
	.middleware([requirePermission({ product: ["create"] })])
	.validator(
		productInsertSchema.extend({
			/** Units already in the shop; recorded as the first restock. */
			openingStock: z.int().nonnegative().default(0),
		}),
	)
	.handler(({ data: { openingStock, ...input }, context }) =>
		db
			.transaction(async (tx) => {
				const [product] = await tx
					.insert(products)
					.values({ ...input, stock: openingStock })
					.returning();
				if (openingStock > 0) {
					await tx.insert(stockMovements).values({
						productId: product.id,
						quantity: openingStock,
						reason: "restock",
						note: "Opening stock",
						createdBy: context.user.id,
					});
				}
				return product;
			})
			.catch(slugTaken(input.slug)),
	);

export const updateProduct = createServerFn({ method: "POST" })
	.middleware([requirePermission({ product: ["update"] })])
	.validator(productUpdateSchema)
	.handler(async ({ data: { id, ...changes } }) => {
		const [before] = await db
			.select({ images: products.images })
			.from(products)
			.where(eq(products.id, id));
		if (!before) throw notFound();
		const [product] = await db
			.update(products)
			.set(changes)
			.where(eq(products.id, id))
			.returning()
			.catch(slugTaken(changes.slug));
		if (!product) throw notFound();
		// Only after the save succeeds, so a failed save never loses a photo.
		await destroyImages(
			before.images.filter((url) => !product.images.includes(url)),
		);
		return product;
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.middleware([requirePermission({ product: ["delete"] })])
	.validator(z.object({ id: z.uuid() }))
	.handler(async ({ data }) => {
		const deleted = await db
			.delete(products)
			.where(eq(products.id, data.id))
			.returning({ images: products.images });
		await destroyImages(deleted.flatMap((p) => p.images));
	});

/**
 * Deletes uploads that were removed from the form before it was saved. Anything a product
 * still uses is skipped, so this can't delete a live photo.
 */
export const discardUploads = createServerFn({ method: "POST" })
	.middleware([requirePermission({ product: ["update"] })])
	.validator(z.object({ urls: z.array(z.url()).max(12) }))
	.handler(async ({ data }) => {
		const used = await db
			.select({ images: products.images })
			.from(products)
			.where(arrayOverlaps(products.images, data.urls));
		const inUse = new Set(used.flatMap((p) => p.images));
		await destroyImages(data.urls.filter((url) => !inUse.has(url)));
	});

/**
 * Signs a direct browser upload to Cloudinary. The browser sends the file straight there,
 * so it never passes through our server, but it can't upload without this signature.
 */
export const signProductUpload = createServerFn({ method: "POST" })
	.middleware([requirePermission({ product: ["update"] })])
	.handler(() => {
		const config = cloudinaryConfig();
		if (!config) {
			throw new Error(
				"Image uploads aren't set up yet. Add the CLOUDINARY_* keys to .env.",
			);
		}
		const params = {
			allowed_formats: "jpg,jpeg,png,webp,avif,heic",
			folder: UPLOAD_FOLDER,
			timestamp: Math.round(Date.now() / 1000),
		};
		return {
			...params,
			url: `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
			api_key: config.apiKey,
			signature: sign(params, config.apiSecret),
		};
	});

/** Records a stock movement and updates the product's count in one transaction. */
export const adjustStock = createServerFn({ method: "POST" })
	.middleware([requirePermission({ stock: ["adjust"] })])
	.validator(stockMovementInsertSchema)
	.handler(({ data, context }) =>
		db.transaction(async (tx) => {
			const [product] = await tx
				.update(products)
				.set({ stock: sql`${products.stock} + ${data.quantity}` })
				.where(eq(products.id, data.productId))
				.returning();
			if (!product) throw notFound();
			if (product.stock < 0) {
				// Throwing rolls the update back.
				throw new Error(
					`Only ${product.stock - data.quantity} of ${product.name} in stock.`,
				);
			}
			await tx
				.insert(stockMovements)
				.values({ ...data, createdBy: context.user.id });
			return product;
		}),
	);
