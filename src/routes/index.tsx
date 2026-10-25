import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	ArrowRight,
	ArrowUpRight,
	Fuel,
	MoonStar,
	VolumeX,
	WandSparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Price, ProductCard } from "#/components/product-card";
import { TikTokEmbed } from "#/components/tiktok-embed";
import { WhatsAppButton } from "#/components/whatsapp-button";
import { categories, getCategory, type Product, videos } from "#/data/products";
import { site } from "#/data/site";
import { imageUrl } from "#/lib/image-url";
import { productsQuery, useProducts } from "#/queries/products";

export const Route = createFileRoute("/")({
	loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery()),
	component: Home,
});

const scenes = [
	"/images/hero.jpg",
	"/images/install.jpg",
	"/images/panels.jpg",
];

// One backdrop per slide: the shop photo first. Products without one get their category
// photo or a solar scene, never the same as the slide before or after, so the hero
// always changes.
function backdrops(products: Product[]) {
	const picked: string[] = [];
	const uses = new Map<string, number>();
	products.forEach((product, i) => {
		const photo = product.images[0] && imageUrl(product.images[0], 2400);
		const category = getCategory(product.category)?.image;
		const options = photo
			? [photo]
			: [...new Set([category ?? scenes[0], ...scenes])];
		const isLast = i === products.length - 1 && i > 0;
		const fresh = options.filter(
			(o) => o !== picked[i - 1] && !(isLast && o === picked[0]),
		);
		const choice = (fresh.length ? fresh : options).reduce((best, o) =>
			(uses.get(o) ?? 0) < (uses.get(best) ?? 0) ? o : best,
		);
		uses.set(choice, (uses.get(choice) ?? 0) + 1);
		picked.push(choice);
	});
	return picked;
}

function Home() {
	return (
		<>
			<Showcase />
			<Marquee />
			<Discover />
			<SolarMerlin />
			<CategoryIndex />
			<CalculatorBlock />
			<Videos />
		</>
	);
}

function Showcase() {
	const products = useProducts();
	const showcase = useMemo(
		() => products.filter((p) => p.featured),
		[products],
	);
	const [index, setIndex] = useState(0);
	const product = showcase[index % showcase.length];
	const count = showcase.length;
	const backdrop = useMemo(() => backdrops(showcase), [showcase]);
	const go = useCallback(
		(step: number) => setIndex((i) => (i + step + count) % count),
		[count],
	);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") go(1);
			if (e.key === "ArrowLeft") go(-1);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [go]);

	if (!product) return null;

	return (
		<section className="relative isolate -mt-18 flex h-svh min-h-[640px] flex-col overflow-hidden md:-mt-20">
			<img
				key={backdrop[index % count]}
				src={backdrop[index % count]}
				alt=""
				className="absolute inset-0 -z-10 size-full animate-fade-in object-cover"
			/>
			<div className="absolute inset-0 -z-10 bg-gradient-to-t from-paper via-paper/85 to-paper/10" />
			{/* keeps the transparent navbar legible over bright sky */}
			<div className="absolute inset-x-0 top-0 -z-10 h-56 bg-gradient-to-b from-ink/70 to-transparent" />

			<div className="flex flex-1 flex-col justify-between px-4 pt-24 pb-6 md:px-8 md:pt-28">
				<div className="flex items-center justify-between">
					<span className="label bg-paper/80 px-2 py-1 backdrop-blur">
						{getCategory(product.category)?.name}
					</span>
					<div
						className="flex gap-1.5"
						role="tablist"
						aria-label="Featured products"
					>
						{showcase.map((p, i) => (
							<button
								key={p.slug}
								type="button"
								role="tab"
								aria-selected={i === index}
								aria-label={p.name}
								onClick={() => setIndex(i)}
								className={`h-1.5 transition-all ${i === index ? "w-8 bg-ink" : "w-4 bg-ink/25 hover:bg-ink/50"}`}
							/>
						))}
					</div>
				</div>

				<div>
					<p className="label mb-3 text-mute">{product.brand ?? "Tee Solar"}</p>
					<h1
						key={product.slug}
						className="display max-w-[14ch] animate-fade-in text-[13vw] md:text-[8.5vw]"
					>
						{product.name}
					</h1>
					<div className="mt-6 flex flex-wrap items-end justify-between gap-6">
						<div className="flex items-center gap-6">
							<Price product={product} className="text-2xl font-medium" />
							<div className="flex gap-1">
								<ArrowButton label="Previous product" onClick={() => go(-1)}>
									<ArrowLeft className="size-5" aria-hidden="true" />
								</ArrowButton>
								<ArrowButton label="Next product" onClick={() => go(1)}>
									<ArrowRight className="size-5" aria-hidden="true" />
								</ArrowButton>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							<Link
								to="/products/$slug"
								params={{ slug: product.slug }}
								className="label inline-flex h-12 items-center border border-ink bg-paper/60 px-5 backdrop-blur hover:bg-ink hover:text-paper"
							>
								View product
							</Link>
							<WhatsAppButton
								message={`Hi Tee Solar, how much is the ${product.name} today?`}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function ArrowButton({
	label,
	onClick,
	disabled,
	children,
}: {
	label: string;
	onClick: () => void;
	disabled?: boolean;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
			className="grid size-12 place-items-center border border-ink transition-colors hover:bg-ink hover:text-paper disabled:border-line disabled:text-line disabled:hover:bg-transparent"
		>
			{children}
		</button>
	);
}

function Marquee() {
	const words = [
		"No fuel",
		"No noise",
		"No NEPA wahala",
		"Ask the Solar Merlin",
		site.motto,
	];
	return (
		<div
			className="overflow-hidden border-y border-line py-6"
			aria-hidden="true"
		>
			<div className="flex w-max animate-marquee">
				{[0, 1].map((copy) => (
					<div key={copy} className="flex">
						{words.map((w) => (
							<span
								key={w}
								className="display flex items-center px-6 text-6xl md:text-8xl"
							>
								{w}
								<span className="ml-12 size-4 rounded-full bg-sun" />
							</span>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

function Discover() {
	const products = useProducts();
	const scroller = useRef<HTMLDivElement>(null);
	const [edges, setEdges] = useState({ start: true, end: false });

	useEffect(() => {
		const el = scroller.current;
		if (!el) return;
		const update = () =>
			setEdges({
				start: el.scrollLeft <= 4,
				end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
			});
		update();
		el.addEventListener("scroll", update, { passive: true });
		window.addEventListener("resize", update);
		return () => {
			el.removeEventListener("scroll", update);
			window.removeEventListener("resize", update);
		};
	}, []);

	const scroll = (direction: 1 | -1) => {
		const el = scroller.current;
		el?.scrollBy({
			left: direction * el.clientWidth * 0.8,
			behavior: "smooth",
		});
	};

	return (
		<section className="pt-24">
			<div className="flex flex-wrap items-end justify-between gap-6 px-4 md:px-8">
				<h2 className="display text-5xl md:text-7xl">
					What's in
					<br />
					the shop
				</h2>
				<div className="flex items-center gap-6">
					<Link
						to="/products"
						className="label flex items-center gap-2 underline"
					>
						All products <ArrowRight className="size-4" aria-hidden="true" />
					</Link>
					<div className="flex gap-1">
						<ArrowButton
							label="Scroll products left"
							onClick={() => scroll(-1)}
							disabled={edges.start}
						>
							<ArrowLeft className="size-5" aria-hidden="true" />
						</ArrowButton>
						<ArrowButton
							label="Scroll products right"
							onClick={() => scroll(1)}
							disabled={edges.end}
						>
							<ArrowRight className="size-5" aria-hidden="true" />
						</ArrowButton>
					</div>
				</div>
			</div>
			<div
				ref={scroller}
				className="no-scrollbar mt-10 flex snap-x snap-mandatory scroll-px-4 gap-px overflow-x-auto overscroll-x-contain border-y border-line bg-line md:scroll-px-8"
			>
				{products.map((p) => (
					<div
						key={p.slug}
						className="w-[78%] shrink-0 snap-start first:ml-4 last:mr-4 sm:w-[42%] md:first:ml-8 md:last:mr-8 lg:w-[24%]"
					>
						<ProductCard product={p} />
					</div>
				))}
			</div>
		</section>
	);
}

// The owner calls himself "the Solar Merlin" in his TikToks — lean into it.
const spells = [
	{
		icon: VolumeX,
		name: "Spell of silence",
		body: "Makes generator noise disappear. Your neighbours will thank him.",
	},
	{
		icon: Fuel,
		name: "The empty jerrycan",
		body: "Fuel queues, fuel prices, fuel stress. One wave and they're gone.",
	},
	{
		icon: MoonStar,
		name: "Light at night",
		body: "Turns today's sunshine into tonight's light. The lithium battery helps a little.",
	},
];

function SolarMerlin() {
	return (
		<section className="mx-4 mt-32 bg-sun text-ink md:mx-8">
			<div className="grid gap-12 p-8 md:grid-cols-[1.1fr_1fr] md:p-14">
				<div className="flex flex-col">
					<p className="label">The man behind the magic</p>
					<h2 className="display mt-4 flex items-start gap-4 text-6xl md:text-8xl">
						<span>
							The Solar
							<br />
							Merlin
						</span>
						<WandSparkles
							className="mt-2 size-10 shrink-0 md:size-14"
							aria-hidden="true"
						/>
					</h2>
					<p className="mt-8 max-w-md text-lg">
						Some people sell inverters. Our guy calls himself the Solar Merlin,
						and honestly, we've stopped arguing with him. He turns sunshine into
						light and sends generator wahala back to where it came from.
					</p>
					<p className="mt-3 max-w-md text-lg font-medium">
						No wand needed on your side. Just a WhatsApp message.
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-6">
						<WhatsAppButton message="Hi Solar Merlin, my house needs some solar magic. Can you help?">
							Summon the Merlin
						</WhatsAppButton>
						<a
							href={site.social.tiktok}
							target="_blank"
							rel="noreferrer"
							className="label flex items-center gap-1 underline"
						>
							Watch him work{" "}
							<ArrowUpRight className="size-4" aria-hidden="true" />
						</a>
					</div>
				</div>

				<div className="flex flex-col justify-end">
					<p className="label">His favourite spells</p>
					<ul className="mt-4 border-t border-ink">
						{spells.map((spell) => (
							<li
								key={spell.name}
								className="flex gap-5 border-b border-ink py-6"
							>
								<spell.icon
									className="mt-1 size-6 shrink-0"
									aria-hidden="true"
								/>
								<div>
									<h3 className="text-xl font-semibold">{spell.name}</h3>
									<p className="mt-1">{spell.body}</p>
								</div>
							</li>
						))}
					</ul>
					<p className="label mt-4 text-ink/60">
						Results may vary. Magic powered by sunlight and lithium batteries.
					</p>
				</div>
			</div>
		</section>
	);
}

function CategoryIndex() {
	const products = useProducts();
	return (
		<section className="px-4 pt-32 md:px-8">
			<p className="label text-mute">Shop by category</p>
			<ul className="mt-6 border-t border-ink">
				{categories.map((c) => {
					const count = products.filter((p) => p.category === c.id).length;
					return (
						<li key={c.id}>
							<Link
								to="/products"
								search={{ category: c.id }}
								className="group grid grid-cols-[1fr_auto] items-center gap-4 border-b border-ink py-6 transition-colors hover:bg-ink hover:text-paper md:grid-cols-[1fr_1fr_auto] md:px-4"
							>
								<span className="display text-4xl md:text-6xl">{c.name}</span>
								<span className="hidden max-w-sm text-sm text-mute group-hover:text-paper/70 md:block">
									{c.blurb}
								</span>
								<span className="label flex items-center gap-2">
									{count} items{" "}
									<ArrowRight className="size-4" aria-hidden="true" />
								</span>
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

function CalculatorBlock() {
	return (
		<section className="mx-4 mt-32 grid gap-10 bg-ink p-8 text-paper md:mx-8 md:grid-cols-2 md:p-14">
			<div>
				<p className="label text-paper/50">Load calculator</p>
				<h2 className="display mt-4 text-5xl md:text-7xl">
					What do you
					<br />
					want to power?
				</h2>
			</div>
			<div className="flex flex-col justify-end gap-6">
				<p className="max-w-md text-lg text-paper/70">
					Not sure what size to buy? Tick the things you want to run, like your
					fridge, AC or Starlink, and we'll show you the inverter, battery and
					panels you need. Then send the list to us on WhatsApp.
				</p>
				<Link
					to="/calculator"
					className="label inline-flex h-12 w-fit items-center gap-2 bg-sun px-5 text-ink hover:bg-paper"
				>
					Open calculator <ArrowRight className="size-4" aria-hidden="true" />
				</Link>
			</div>
		</section>
	);
}

function Videos() {
	return (
		<section className="px-4 pt-32 md:px-8">
			<div className="flex items-end justify-between">
				<h2 className="display text-5xl md:text-7xl">
					See it
					<br />
					working
				</h2>
				<a
					href={site.social.tiktok}
					target="_blank"
					rel="noreferrer"
					className="label flex items-center gap-1 underline"
				>
					@teesolarinverter{" "}
					<ArrowUpRight className="size-4" aria-hidden="true" />
				</a>
			</div>
			<div className="mt-10 grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
				{videos.map((v) => (
					<TikTokEmbed key={v.id} id={v.id} title={v.title} />
				))}
			</div>
		</section>
	);
}
