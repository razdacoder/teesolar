import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Price, ProductCard } from "#/components/product-card";
import { ProductGallery } from "#/components/product-media";
import { TikTokEmbed } from "#/components/tiktok-embed";
import { WhatsAppButton } from "#/components/whatsapp-button";
import { getCategory } from "#/data/products";
import { site } from "#/data/site";
import { productQuery, productsQuery, useProducts } from "#/queries/products";

export const Route = createFileRoute("/products/$slug")({
	loader: async ({ context: { queryClient }, params }) => {
		const [product] = await Promise.all([
			queryClient.ensureQueryData(productQuery(params.slug)),
			queryClient.ensureQueryData(productsQuery()),
		]);
		return { product };
	},
	head: ({ loaderData }) => ({
		meta: loaderData
			? [
					{ title: `${loaderData.product.name} | Tee Solar Inverters` },
					{ name: "description", content: loaderData.product.summary },
				]
			: [],
	}),
	component: ProductPage,
});

function ProductPage() {
	const { slug } = Route.useParams();
	const { data: product } = useSuspenseQuery(productQuery(slug));
	const products = useProducts();
	const category = getCategory(product.category);
	const related = products
		.filter((p) => p.category === product.category && p.slug !== product.slug)
		.slice(0, 4);
	const message = `Hi Tee Solar, I saw the ${product.name} on your website. Is it available, and how much is it today?`;

	return (
		<div>
			<section className="grid md:min-h-[calc(100svh-5rem)] md:grid-cols-[1.3fr_1fr]">
				<div className="relative md:sticky md:top-20 md:h-[calc(100svh-5rem)]">
					<ProductGallery
						// Reset to the main photo when moving to another product.
						key={product.id}
						product={product}
						className="md:h-full"
					/>
				</div>

				<div className="flex flex-col justify-end border-line px-4 pt-10 pb-10 md:border-l md:px-8">
					<nav className="label text-mute">
						<Link to="/products" className="hover:text-ink">
							Shop
						</Link>{" "}
						/{" "}
						<Link
							to="/products"
							search={{ category: product.category }}
							className="hover:text-ink"
						>
							{category?.name}
						</Link>
					</nav>
					{product.brand && <p className="label mt-8">{product.brand}</p>}
					<h1 className="display mt-3 text-6xl md:text-7xl">{product.name}</h1>
					<p className="mt-6 max-w-md text-lg text-mute">{product.summary}</p>

					<ul className="mt-10 border-t border-ink">
						{product.highlights.map((h) => (
							<li
								key={h}
								className="flex items-center gap-3 border-b border-line py-3"
							>
								<span className="size-1.5 rounded-full bg-sun" />
								{h}
							</li>
						))}
					</ul>
					<dl className="border-b border-line">
						<Detail
							label="Condition"
							value={
								product.condition === "fairly used" ? "Fairly used" : "New"
							}
						/>
						<Detail
							label="Warranty"
							value={product.condition === "fairly used" ? "Ask us" : "1 year"}
						/>
						<Detail label="Pickup" value={site.address} />
					</dl>

					<Price product={product} className="mt-10 text-3xl font-medium" />
					<p className="label mt-2 text-mute">
						Ask for today's price before you pay
					</p>
					<div className="mt-6 grid gap-2 sm:grid-cols-2">
						<WhatsAppButton message={message} />
						<a
							href={`tel:${site.phoneTel}`}
							className="label inline-flex h-12 items-center justify-center border border-ink hover:bg-ink hover:text-paper"
						>
							Call {site.phoneDisplay}
						</a>
					</div>
				</div>
			</section>

			{product.video && (
				<section className="grid gap-10 px-4 pt-32 md:grid-cols-[1fr_20rem] md:px-8">
					<h2 className="display text-5xl md:text-7xl">
						Watch it
						<br />
						on TikTok
					</h2>
					<TikTokEmbed id={product.video} title={product.name} />
				</section>
			)}

			{related.length > 0 && (
				<section className="px-4 pt-32 md:px-8">
					<h2 className="display text-5xl md:text-7xl">You might also like</h2>
					<div className="mt-10 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
						{related.map((p) => (
							<ProductCard key={p.slug} product={p} />
						))}
					</div>
				</section>
			)}
		</div>
	);
}

function Detail({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between gap-6 border-t border-line py-3 first:border-t-0">
			<dt className="label shrink-0 text-mute">{label}</dt>
			<dd className="text-right">{value}</dd>
		</div>
	);
}
