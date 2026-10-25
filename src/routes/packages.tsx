import { createFileRoute, Link } from "@tanstack/react-router";
import { Price } from "#/components/product-card";
import { WhatsAppButton } from "#/components/whatsapp-button";
import { productsQuery, useProducts } from "#/queries/products";

export const Route = createFileRoute("/packages")({
	head: () => ({ meta: [{ title: "Solar packages | Tee Solar Inverters" }] }),
	loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery()),
	component: Packages,
});

const steps = [
	{
		title: "Tell us what you want to run",
		body: "List the things you need powered and how long your light usually goes off.",
	},
	{
		title: "Get a quote",
		body: "We suggest the right inverter, battery and panels for your budget. No pressure to buy the biggest one.",
	},
	{
		title: "We install",
		body: "Our team delivers, mounts and wires everything, then shows you how to use it.",
	},
];

function Packages() {
	const packages = useProducts().filter((p) => p.category === "packages");
	return (
		<div className="px-4 pt-12 md:px-8">
			<p className="label text-mute">Packages · we supply and install</p>
			<h1 className="display mt-4 text-[15vw] md:text-[9vw]">
				One price.
				<br />
				Lights on.
			</h1>

			<div className="mt-16 border-t border-ink">
				{packages.map((p) => (
					<article
						key={p.slug}
						className="grid gap-6 border-b border-ink py-10 md:grid-cols-[1.2fr_1fr_auto] md:items-start"
					>
						<div>
							<h2 className="display text-4xl md:text-5xl">{p.name}</h2>
							<p className="mt-3 max-w-md text-mute">{p.summary}</p>
						</div>
						<ul className="space-y-1">
							{p.highlights.map((h) => (
								<li key={h} className="flex items-center gap-2">
									<span className="size-1.5 rounded-full bg-sun" />
									{h}
								</li>
							))}
						</ul>
						<div className="flex flex-col gap-3 md:items-end">
							<Price product={p} className="text-2xl font-medium" />
							<div className="flex gap-2">
								<Link
									to="/products/$slug"
									params={{ slug: p.slug }}
									className="label inline-flex h-12 items-center border border-ink px-4 hover:bg-ink hover:text-paper"
								>
									Details
								</Link>
								<WhatsAppButton
									message={`Hi Tee Solar, please send me a quote for the ${p.name}.`}
								>
									Quote
								</WhatsAppButton>
							</div>
						</div>
					</article>
				))}
			</div>

			<section className="pt-32">
				<h2 className="display text-5xl md:text-7xl">How it works</h2>
				<div className="mt-10 grid gap-px bg-line md:grid-cols-3">
					{steps.map((s) => (
						<div key={s.title} className="bg-card p-8">
							<span className="block h-1.5 w-10 bg-sun" />
							<h3 className="mt-12 text-2xl font-medium">{s.title}</h3>
							<p className="mt-2 text-mute">{s.body}</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
