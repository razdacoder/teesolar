import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "#/components/product-card";
import { type CategoryId, categories, isCategoryId } from "#/data/products";
import { productsQuery, useProducts } from "#/queries/products";

interface ProductsSearch {
	category?: CategoryId;
}

export const Route = createFileRoute("/products/")({
	validateSearch: (search: Record<string, unknown>): ProductsSearch =>
		isCategoryId(search.category) ? { category: search.category } : {},
	head: () => ({ meta: [{ title: "Shop solar | Tee Solar Inverters" }] }),
	loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery()),
	component: Products,
});

function Products() {
	const { category } = Route.useSearch();
	const products = useProducts();
	const active = categories.find((c) => c.id === category);
	const list = category
		? products.filter((p) => p.category === category)
		: products;

	return (
		<div className="px-4 pt-12 md:px-8">
			<p className="label text-mute">Shop · {list.length} items</p>
			<h1 className="display mt-4 text-[15vw] md:text-[9vw]">
				{active?.name ?? "Everything"}
			</h1>
			<p className="mt-6 max-w-md text-mute">
				{active?.blurb ??
					"From small solar generators to full home installations. Prices change with the dollar, so message us on WhatsApp for today's price."}
			</p>

			<div className="no-scrollbar mt-12 flex gap-6 overflow-x-auto border-y border-line py-4">
				<FilterLink label="All" active={!category} />
				{categories.map((c) => (
					<FilterLink
						key={c.id}
						label={c.name}
						category={c.id}
						active={category === c.id}
					/>
				))}
			</div>

			<div className="mt-px grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
				{list.map((p) => (
					<ProductCard key={p.slug} product={p} />
				))}
			</div>
		</div>
	);
}

function FilterLink({
	label,
	category,
	active,
}: {
	label: string;
	category?: CategoryId;
	active: boolean;
}) {
	return (
		<Link
			to="/products"
			search={category ? { category } : {}}
			className={`label shrink-0 ${active ? "text-ink underline decoration-sun decoration-2 underline-offset-4" : "text-mute hover:text-ink"}`}
		>
			{label}
		</Link>
	);
}
