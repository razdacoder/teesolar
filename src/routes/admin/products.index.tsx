import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PackagePlus, Plus, Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { StockForm } from "#/components/admin/stock-form";
import {
	Badge,
	Button,
	Card,
	Dialog,
	Empty,
	Input,
	PageHeader,
	Select,
} from "#/components/admin/ui";
import { useAdmin } from "#/components/admin/use-admin";
import { ProductImage } from "#/components/product-media";
import { categories, getCategory, LOW_STOCK } from "#/data/products";
import { formatNaira } from "#/data/site";
import { categoryEnum, type Product } from "#/db/schema";
import { adminProductsQuery } from "#/queries/products";

const statuses = {
	all: "All",
	published: "In the shop",
	hidden: "Hidden",
	low: "Running low",
	out: "Out of stock",
} as const;

const searchSchema = z.object({
	q: z.string().optional().catch(undefined),
	category: z.enum(categoryEnum.enumValues).optional().catch(undefined),
	status: z
		.enum(Object.keys(statuses) as [keyof typeof statuses])
		.optional()
		.catch(undefined),
});

export const Route = createFileRoute("/admin/products/")({
	validateSearch: searchSchema,
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(adminProductsQuery()),
	component: Products,
});

function matches(
	p: Product,
	{ q, category, status }: z.infer<typeof searchSchema>,
) {
	if (category && p.category !== category) return false;
	if (status === "published" && !p.published) return false;
	if (status === "hidden" && p.published) return false;
	if (status === "low" && p.stock > LOW_STOCK) return false;
	if (status === "out" && p.stock > 0) return false;
	if (q) {
		const needle = q.toLowerCase();
		return [p.name, p.brand, p.slug].some((s) =>
			s?.toLowerCase().includes(needle),
		);
	}
	return true;
}

function Products() {
	const { can } = useAdmin();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const { data: products } = useSuspenseQuery(adminProductsQuery());
	const [adjusting, setAdjusting] = useState<Product | null>(null);

	const list = products.filter((p) => matches(p, search));
	const setSearch = (next: Partial<z.infer<typeof searchSchema>>) =>
		navigate({ search: (s) => ({ ...s, ...next }), replace: true });

	return (
		<div className="grid gap-6">
			<PageHeader
				title="Products"
				description={`${products.length} products, ${list.length} shown`}
				actions={
					can({ product: ["create"] }) && (
						<Link
							to="/admin/products/new"
							className="label inline-flex h-10 items-center gap-2 bg-ink px-4 text-paper hover:bg-ink/85"
						>
							<Plus className="size-4" aria-hidden="true" /> New product
						</Link>
					)
				}
			/>

			<div className="grid gap-2 sm:grid-cols-[1fr_12rem_12rem]">
				<div className="relative">
					<Search
						className="pointer-events-none absolute top-3 left-3 size-4 text-mute"
						aria-hidden="true"
					/>
					<Input
						type="search"
						aria-label="Search products"
						placeholder="Search by name, brand or slug"
						defaultValue={search.q}
						onChange={(e) => setSearch({ q: e.target.value || undefined })}
						className="pl-9"
					/>
				</div>
				<Select
					aria-label="Category"
					value={search.category ?? ""}
					onChange={(e) =>
						setSearch({
							category: (e.target.value || undefined) as typeof search.category,
						})
					}
				>
					<option value="">All categories</option>
					{categories.map((c) => (
						<option key={c.id} value={c.id}>
							{c.name}
						</option>
					))}
				</Select>
				<Select
					aria-label="Status"
					value={search.status ?? "all"}
					onChange={(e) =>
						setSearch({
							status:
								e.target.value === "all"
									? undefined
									: (e.target.value as typeof search.status),
						})
					}
				>
					{Object.entries(statuses).map(([id, label]) => (
						<option key={id} value={id}>
							{label}
						</option>
					))}
				</Select>
			</div>

			<Card className="overflow-x-auto">
				{list.length === 0 ? (
					<Empty>No products match those filters.</Empty>
				) : (
					<table className="w-full min-w-[760px] text-left text-sm">
						<thead className="border-b border-line">
							<tr className="label text-mute">
								<th className="px-5 py-3 font-normal">Product</th>
								<th className="px-3 py-3 font-normal">Category</th>
								<th className="px-3 py-3 font-normal">Price</th>
								<th className="px-3 py-3 font-normal">Status</th>
								<th className="px-3 py-3 text-right font-normal">Stock</th>
								<th className="px-5 py-3">
									<span className="sr-only">Actions</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{list.map((p) => (
								<tr
									key={p.id}
									className="border-b border-line last:border-0 hover:bg-paper"
								>
									<td className="px-5 py-3">
										<div className="flex items-center gap-3">
											<ProductImage
												product={p}
												width={40}
												className="size-10 shrink-0"
												iconClassName="size-1/2"
											/>
											<div className="min-w-0">
												<Link
													to="/admin/products/$id"
													params={{ id: p.id }}
													className="font-medium hover:underline"
												>
													{p.name}
												</Link>
												<p className="text-xs text-mute">
													{p.brand ?? "No brand"}
												</p>
											</div>
										</div>
									</td>
									<td className="px-3 py-3 text-mute">
										{getCategory(p.category)?.name}
									</td>
									<td className="px-3 py-3">
										{p.price === null ? (
											<span className="text-mute">Ask</span>
										) : (
											formatNaira(p.price)
										)}
									</td>
									<td className="px-3 py-3">
										<div className="flex gap-1">
											{p.published ? (
												<Badge tone="green">Live</Badge>
											) : (
												<Badge>Hidden</Badge>
											)}
											{p.featured && <Badge tone="ink">Featured</Badge>}
										</div>
									</td>
									<td className="px-3 py-3 text-right">
										<StockBadge stock={p.stock} />
									</td>
									<td className="px-5 py-3 text-right">
										{can({ stock: ["adjust"] }) && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => setAdjusting(p)}
											>
												<PackagePlus className="size-3.5" aria-hidden="true" />
												Stock
											</Button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</Card>

			<Dialog
				open={adjusting !== null}
				onClose={() => setAdjusting(null)}
				title={adjusting ? `Stock: ${adjusting.name}` : ""}
			>
				{adjusting && (
					<StockForm
						productId={adjusting.id}
						stock={adjusting.stock}
						onDone={() => setAdjusting(null)}
					/>
				)}
			</Dialog>
		</div>
	);
}

function StockBadge({ stock }: { stock: number }) {
	if (stock === 0) return <Badge tone="red">Out</Badge>;
	if (stock <= LOW_STOCK) return <Badge tone="sun">{stock} left</Badge>;
	return <span className="font-mono">{stock}</span>;
}
