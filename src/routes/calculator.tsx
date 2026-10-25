import { createFileRoute, Link } from "@tanstack/react-router";
import {
	AirVent,
	ArrowRight,
	BatteryCharging,
	Droplets,
	Fan,
	Laptop,
	Lightbulb,
	type LucideIcon,
	Microwave,
	Minus,
	Monitor,
	Phone,
	Plus,
	Refrigerator,
	RotateCcw,
	Router,
	SatelliteDish,
	Shirt,
	Smartphone,
	Snowflake,
	Sun,
	TriangleAlert,
	Tv,
	Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Price } from "#/components/product-card";
import { WhatsAppButton } from "#/components/whatsapp-button";
import { site } from "#/data/site";
import { productsQuery, useProducts } from "#/queries/products";

export const Route = createFileRoute("/calculator")({
	head: () => ({
		meta: [{ title: "Solar load calculator | Tee Solar Inverters" }],
	}),
	loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery()),
	component: Calculator,
});

interface Appliance {
	id: string;
	name: string;
	icon: LucideIcon;
	/** Typical running watts — rough guides, the team confirms before quoting. */
	watts: number;
	/** Hours a day it actually draws power (a fridge compressor runs about half the time). */
	hours: number;
	heavy?: boolean;
}

const groups: { title: string; items: Appliance[] }[] = [
	{
		title: "Lights & fans",
		items: [
			{ id: "bulb", name: "LED bulb", icon: Lightbulb, watts: 10, hours: 6 },
			{ id: "fan", name: "Standing fan", icon: Fan, watts: 70, hours: 8 },
			{
				id: "phone",
				name: "Phone charging",
				icon: Smartphone,
				watts: 10,
				hours: 3,
			},
		],
	},
	{
		title: "Work & entertainment",
		items: [
			{ id: "tv", name: "LED TV", icon: Tv, watts: 100, hours: 5 },
			{
				id: "decoder",
				name: "Decoder",
				icon: SatelliteDish,
				watts: 30,
				hours: 5,
			},
			{
				id: "router",
				name: "Wi-Fi router",
				icon: Router,
				watts: 15,
				hours: 12,
			},
			{
				id: "starlink",
				name: "Starlink",
				icon: SatelliteDish,
				watts: 75,
				hours: 12,
			},
			{ id: "laptop", name: "Laptop", icon: Laptop, watts: 65, hours: 6 },
			{
				id: "desktop",
				name: "Desktop computer",
				icon: Monitor,
				watts: 250,
				hours: 6,
			},
		],
	},
	{
		title: "Kitchen",
		items: [
			{
				id: "fridge",
				name: "Fridge",
				icon: Refrigerator,
				watts: 150,
				hours: 12,
			},
			{
				id: "freezer",
				name: "Chest freezer",
				icon: Snowflake,
				watts: 200,
				hours: 12,
			},
			{
				id: "microwave",
				name: "Microwave",
				icon: Microwave,
				watts: 1000,
				hours: 0.3,
				heavy: true,
			},
		],
	},
	{
		title: "Heavy appliances",
		items: [
			{
				id: "ac1",
				name: "1HP air conditioner",
				icon: AirVent,
				watts: 900,
				hours: 6,
				heavy: true,
			},
			{
				id: "ac15",
				name: "1.5HP air conditioner",
				icon: AirVent,
				watts: 1300,
				hours: 6,
				heavy: true,
			},
			{
				id: "pump",
				name: "Pumping machine",
				icon: Droplets,
				watts: 750,
				hours: 1,
				heavy: true,
			},
			{
				id: "iron",
				name: "Pressing iron",
				icon: Shirt,
				watts: 1000,
				hours: 0.5,
				heavy: true,
			},
		],
	},
];

const appliances = groups.flatMap((g) => g.items);

type Quantities = Record<string, number>;

const presets: {
	name: string;
	hint: string;
	qty: Quantities;
	hours: number;
}[] = [
	{
		name: "Small apartment",
		hint: "Lights, fans, TV, Wi-Fi",
		qty: { bulb: 5, fan: 2, phone: 2, tv: 1, decoder: 1, router: 1 },
		hours: 8,
	},
	{
		name: "Family home",
		hint: "Adds fridge, freezer, laptop",
		qty: {
			bulb: 10,
			fan: 4,
			phone: 4,
			tv: 2,
			decoder: 1,
			router: 1,
			laptop: 2,
			fridge: 1,
			freezer: 1,
		},
		hours: 12,
	},
	{
		name: "Home with AC",
		hint: "Family home plus a 1HP AC",
		qty: {
			bulb: 10,
			fan: 3,
			phone: 4,
			tv: 2,
			decoder: 1,
			router: 1,
			laptop: 2,
			fridge: 1,
			freezer: 1,
			ac1: 1,
		},
		hours: 12,
	},
	{
		name: "Shop or office",
		hint: "Lights, computers, Starlink",
		qty: {
			bulb: 6,
			fan: 2,
			phone: 3,
			router: 1,
			starlink: 1,
			laptop: 2,
			desktop: 1,
		},
		hours: 10,
	},
];

const hourChoices = [4, 8, 12, 24];
const inverterSizes = [0.5, 1, 1.5, 2, 3, 3.5, 4.2, 5, 6, 8, 10, 12, 15];
const batterySizes = [1, 2, 3, 5, 7.5, 10, 15, 20, 30];
const PANEL_WATTS = 600;
const SUN_HOURS = 5;
// Inverters are rated in kVA; at a 0.8 power factor 1kVA delivers about 800W.
const WATTS_PER_KVA = 800;

function roundUpTo(sizes: number[], value: number) {
	return sizes.find((s) => s >= value) ?? sizes[sizes.length - 1];
}

function Calculator() {
	const products = useProducts();
	const [qty, setQty] = useState<Quantities>({});
	const [hours, setHours] = useState(8);
	const resultRef = useRef<HTMLElement>(null);
	const [resultVisible, setResultVisible] = useState(false);

	const chosen = appliances.filter((a) => (qty[a.id] ?? 0) > 0);
	const itemCount = chosen.reduce((sum, a) => sum + qty[a.id], 0);

	const result = useMemo(() => {
		let load = 0;
		let energy = 0;
		for (const a of appliances) {
			const n = qty[a.id] ?? 0;
			load += a.watts * n;
			// The battery only carries what runs while the light is off.
			energy += a.watts * n * Math.min(a.hours, hours);
		}
		// 25% headroom for start-up surges.
		const kva = roundUpTo(inverterSizes, (load * 1.25) / WATTS_PER_KVA);
		// 80% usable depth of discharge on lithium.
		const kwhNeeded = energy / 1000 / 0.8;
		const kwh = roundUpTo(batterySizes, kwhNeeded);
		const panels = Math.max(
			1,
			Math.ceil(energy / (PANEL_WATTS * SUN_HOURS * 0.75)),
		);
		const usage = load / (kva * WATTS_PER_KVA);
		const heavy = appliances.filter((a) => a.heavy && (qty[a.id] ?? 0) > 0);
		return { load, energy, kva, kwh, kwhNeeded, panels, usage, heavy };
	}, [qty, hours]);

	// Ready-made units whose output covers the load. Ones whose battery also
	// covers the backup hours come first; the rest can take extra batteries.
	const fits = useMemo(() => {
		if (result.load === 0) return [];
		const needed = result.load * 1.25;
		return products
			.filter((p) => p.output != null && p.output >= needed)
			.map((p) => ({
				product: p,
				battery:
					p.storage == null
						? ("ask" as const)
						: p.storage >= result.kwhNeeded
							? ("fits" as const)
							: ("short" as const),
			}))
			.sort(
				(a, b) =>
					Number(b.battery === "fits") - Number(a.battery === "fits") ||
					(a.product.output ?? 0) - (b.product.output ?? 0),
			)
			.slice(0, 3);
	}, [result, products]);

	useEffect(() => {
		const el = resultRef.current;
		if (!el) return;
		const io = new IntersectionObserver(
			([entry]) => setResultVisible(entry.isIntersecting),
			{
				threshold: 0.15,
			},
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	const set = (id: string, value: number) =>
		setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(50, value)) }));

	const applyPreset = (preset: (typeof presets)[number]) => {
		setQty(preset.qty);
		setHours(preset.hours);
	};

	const message = [
		"Hi Tee Solar, please quote me a solar setup for:",
		...chosen.map((a) => `• ${qty[a.id]} × ${a.name}`),
		`My light is usually off for about ${hours} hours a day.`,
		"",
		`Your calculator suggested about a ${result.kva}kVA inverter, a ${result.kwh}kWh battery and ${result.panels} × ${PANEL_WATTS}W panels.`,
	].join("\n");

	return (
		<div className="px-4 pt-12 md:px-8">
			<p className="label text-mute">Load calculator</p>
			<h1 className="display mt-4 text-[15vw] md:text-[9vw]">
				What do you
				<br />
				want to power?
			</h1>
			<div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-mute">
				<span>Pick your appliances</span>
				<ArrowRight className="size-4" aria-hidden="true" />
				<span>Tell us how long the light goes off</span>
				<ArrowRight className="size-4" aria-hidden="true" />
				<span className="text-ink">Get the system you need</span>
			</div>

			<section className="mt-12" aria-labelledby="presets-title">
				<div className="flex items-end justify-between gap-4">
					<h2 id="presets-title" className="label text-mute">
						Start from a typical setup
					</h2>
					{itemCount > 0 && (
						<button
							type="button"
							onClick={() => setQty({})}
							className="label flex items-center gap-1.5 text-mute hover:text-ink"
						>
							<RotateCcw className="size-3.5" aria-hidden="true" /> Clear all
						</button>
					)}
				</div>
				<div className="mt-3 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
					{presets.map((p) => (
						<button
							key={p.name}
							type="button"
							onClick={() => applyPreset(p)}
							className="group flex items-center justify-between gap-4 bg-card p-4 text-left transition-colors hover:bg-ink hover:text-paper"
						>
							<span>
								<span className="block font-medium">{p.name}</span>
								<span className="text-sm text-mute group-hover:text-paper/70">
									{p.hint}
								</span>
							</span>
							<ArrowRight className="size-4 shrink-0" aria-hidden="true" />
						</button>
					))}
				</div>
			</section>

			<div className="mt-12 grid items-start gap-10 lg:grid-cols-[1.5fr_1fr] xl:gap-14">
				<div>
					{groups.map((g) => (
						<section
							key={g.title}
							className="pb-10"
							aria-labelledby={`group-${g.title}`}
						>
							<h2
								id={`group-${g.title}`}
								className="label border-b border-ink pb-3"
							>
								{g.title}
							</h2>
							<div className="grid grid-cols-2 border-l border-line sm:grid-cols-3">
								{g.items.map((a) => (
									<ApplianceTile
										key={a.id}
										appliance={a}
										count={qty[a.id] ?? 0}
										onChange={(v) => set(a.id, v)}
									/>
								))}
							</div>
						</section>
					))}
				</div>

				<aside
					ref={resultRef}
					id="your-setup"
					className="scroll-mt-24 bg-ink p-6 text-paper md:p-8 lg:sticky lg:top-24"
				>
					<p className="label text-paper/50">Your setup</p>

					<div className="mt-6 border-b border-paper/20 pb-6">
						<div className="flex items-end justify-between gap-4">
							<label
								htmlFor="hours"
								className="max-w-[16rem] text-lg leading-snug"
							>
								How many hours is your light off each day?
							</label>
							<output htmlFor="hours" className="display text-5xl text-sun">
								{hours}
								<span className="ml-1 text-base text-paper/70 normal-case">
									hrs
								</span>
							</output>
						</div>
						<input
							id="hours"
							type="range"
							min={1}
							max={24}
							value={hours}
							onChange={(e) => setHours(Number(e.target.value))}
							className="mt-5 w-full accent-sun"
						/>
						<div className="mt-3 flex flex-wrap gap-2">
							{hourChoices.map((h) => (
								<button
									key={h}
									type="button"
									onClick={() => setHours(h)}
									aria-pressed={hours === h}
									className={`label h-9 border px-3 transition-colors ${
										hours === h
											? "border-sun bg-sun text-ink"
											: "border-paper/30 hover:border-paper"
									}`}
								>
									{h === 24 ? "All day" : `${h} hours`}
								</button>
							))}
						</div>
					</div>
					{itemCount === 0 ? (
						<div className="py-16 text-center">
							<Zap className="mx-auto size-10 text-sun" aria-hidden="true" />
							<p className="mt-4 text-lg">
								The Solar Merlin is ready. Tap Add on the things you want to run
								and watch your setup appear.
							</p>
							<p className="mt-1 text-sm text-paper/60">
								Or start with one of the typical setups above.
							</p>
						</div>
					) : (
						<>
							<div className="mt-6">
								<div className="flex items-baseline justify-between">
									<span className="text-sm text-paper/70">
										Everything on at once: {result.load.toLocaleString()}W
									</span>
									<span className="label text-paper/50">
										{Math.round(result.usage * 100)}% of inverter
									</span>
								</div>
								<div className="mt-2 h-2 bg-paper/15">
									<div
										className="h-full bg-sun transition-all duration-500"
										style={{ width: `${Math.min(100, result.usage * 100)}%` }}
									/>
								</div>
							</div>

							<dl className="mt-8 border-t border-paper/20">
								<ResultRow
									icon={Zap}
									label="Inverter"
									value={`${result.kva}kVA`}
									note="Can run all of it at the same time, with extra room for when your fridge or AC kicks in."
								/>
								<ResultRow
									icon={BatteryCharging}
									label="Lithium battery"
									value={`${result.kwh}kWh`}
									note={`Keeps everything going for about ${hours} hours when NEPA takes light.`}
								/>
								<ResultRow
									icon={Sun}
									label="Solar panels"
									value={`${result.panels} × ${PANEL_WATTS}W`}
									note="Enough to fill the battery back up on a normal sunny day."
								/>
							</dl>

							{result.heavy.length > 0 && (
								<p className="mt-6 flex gap-3 border border-sun/40 p-4 text-sm text-paper/85">
									<TriangleAlert
										className="size-5 shrink-0 text-sun"
										aria-hidden="true"
									/>
									<span>{heavyWarning(result.heavy)}</span>
								</p>
							)}

							{fits.length > 0 && (
								<div className="mt-8">
									<p className="label text-paper/50">
										Units that can carry this load
									</p>
									<ul className="mt-3 divide-y divide-paper/15 border-y border-paper/15">
										{fits.map(({ product: p, battery }) => (
											<li key={p.slug}>
												<Link
													to="/products/$slug"
													params={{ slug: p.slug }}
													className="group flex items-center justify-between gap-4 py-3 hover:text-sun"
												>
													<span>
														<span className="block font-medium">{p.name}</span>
														<span className="label text-paper/50">
															{p.output?.toLocaleString()}W
															{p.storage !== undefined && ` · ${p.storage}kWh`}
															{" · "}
															<span
																className={battery === "fits" ? "text-sun" : ""}
															>
																{battery === "fits"
																	? "Battery covers your hours"
																	: battery === "short"
																		? "Add batteries for your hours"
																		: "Ask about battery size"}
															</span>
														</span>
													</span>
													<span className="flex shrink-0 items-center gap-2 text-sm">
														<Price product={p} />
														<ArrowRight className="size-4" aria-hidden="true" />
													</span>
												</Link>
											</li>
										))}
									</ul>
								</div>
							)}

							<WhatsAppButton
								message={message}
								variant="light"
								className="mt-8 w-full"
							>
								Send my list for a quote
							</WhatsAppButton>
							<a
								href={`tel:${site.phoneTel}`}
								className="label mt-2 flex h-12 items-center justify-center gap-2 border border-paper/30 hover:border-paper"
							>
								<Phone className="size-4" aria-hidden="true" /> Call{" "}
								{site.phoneDisplay}
							</a>
							<p className="mt-6 text-xs text-paper/50">
								This is a rough guide based on typical appliances. Before we
								quote, we'll check what you actually have.
							</p>
						</>
					)}
				</aside>
			</div>

			{/* Mobile: keep the answer in view while picking appliances. */}
			{itemCount > 0 && !resultVisible && (
				<div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 bg-ink px-4 py-3 text-paper lg:hidden">
					<div>
						<p className="label text-paper/50">
							{itemCount} {itemCount === 1 ? "item" : "items"} · {hours} hrs
							backup
						</p>
						<p className="font-medium">
							{result.kva}kVA · {result.kwh}kWh · {result.panels} panels
						</p>
					</div>
					<a
						href="#your-setup"
						className="label inline-flex h-11 shrink-0 items-center gap-2 bg-sun px-4 text-ink"
					>
						See setup <ArrowRight className="size-4" aria-hidden="true" />
					</a>
				</div>
			)}
		</div>
	);
}

function ApplianceTile({
	appliance,
	count,
	onChange,
}: {
	appliance: Appliance;
	count: number;
	onChange: (value: number) => void;
}) {
	const Icon = appliance.icon;
	const selected = count > 0;
	return (
		<div
			className={`relative flex flex-col gap-4 border-r border-b border-line p-4 transition-colors ${selected ? "bg-white" : "bg-card"}`}
		>
			{selected && (
				<span
					className="absolute inset-0 border-2 border-ink"
					aria-hidden="true"
				/>
			)}
			<div className="flex items-start justify-between gap-2">
				<Icon
					className={`size-7 ${selected ? "text-ink" : "text-mute"}`}
					aria-hidden="true"
				/>
				{appliance.heavy && (
					<span className="label bg-sun/25 px-1.5 py-0.5 text-ink">Heavy</span>
				)}
			</div>
			<div>
				<p className="leading-tight font-medium">{appliance.name}</p>
				<p className="label mt-1 text-mute">
					About {appliance.watts.toLocaleString()}W
				</p>
			</div>
			{selected ? (
				<div className="relative flex items-center justify-between border border-ink">
					<button
						type="button"
						onClick={() => onChange(count - 1)}
						className="grid size-10 place-items-center hover:bg-paper"
						aria-label={`Remove one ${appliance.name}`}
					>
						<Minus className="size-4" aria-hidden="true" />
					</button>
					<span className="font-medium tabular-nums" aria-live="polite">
						{count}
					</span>
					<button
						type="button"
						onClick={() => onChange(count + 1)}
						className="grid size-10 place-items-center bg-ink text-paper hover:bg-ink/85"
						aria-label={`Add another ${appliance.name}`}
					>
						<Plus className="size-4" aria-hidden="true" />
					</button>
				</div>
			) : (
				<button
					type="button"
					onClick={() => onChange(1)}
					className="label flex h-10 items-center justify-center gap-2 border border-line transition-colors hover:border-ink hover:bg-ink hover:text-paper"
					aria-label={`Add ${appliance.name}`}
				>
					<Plus className="size-4" aria-hidden="true" /> Add
				</button>
			)}
		</div>
	);
}

function ResultRow({
	icon: Icon,
	label,
	value,
	note,
}: {
	icon: LucideIcon;
	label: string;
	value: string;
	note: string;
}) {
	return (
		<div className="flex gap-4 border-b border-paper/20 py-5">
			<Icon className="mt-1 size-5 shrink-0 text-sun" aria-hidden="true" />
			<div className="flex-1">
				<div className="flex items-baseline justify-between gap-4">
					<dt className="label text-paper/60">{label}</dt>
					<dd className="display text-4xl text-sun normal-case">{value}</dd>
				</div>
				<p className="mt-1 text-sm text-paper/70">{note}</p>
			</div>
		</div>
	);
}

function heavyWarning(items: Appliance[]) {
	// Lower-case for mid-sentence use, keeping unit abbreviations like "1HP".
	const names = items.map((a) =>
		a.name.toLowerCase().replace(/(\d)hp/, "$1HP"),
	);
	if (names.length === 1) {
		return `A ${names[0]} pulls a lot of power, so try not to run it together with other heavy appliances.`;
	}
	const list = `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
	return `The ${list} pull a lot of power, so try not to run them at the same time.`;
}
