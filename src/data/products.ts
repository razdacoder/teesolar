// Products live in Postgres (see src/db). Categories stay in code because the icons,
// photos and copy are keyed by id; `categoryEnum` in the schema keeps them in step.
import type { categoryEnum, Product } from "#/db/schema";

export type { Product };
export type CategoryId = (typeof categoryEnum.enumValues)[number];

/** At or below this many units, a product shows up as running low in the admin. */
export const LOW_STOCK = 2;

export interface Category {
	id: CategoryId;
	name: string;
	blurb: string;
	/** Category photo; generators have no generic stock shot, so they use the brand tile. */
	image?: string;
}

export const categories: Category[] = [
	{
		id: "solar-generators",
		name: "Solar Generators",
		blurb:
			"Everything in one box. Charge it from the sun or from NEPA, plug in, and forget about fuel and noise.",
	},
	{
		id: "inverters",
		image: "/images/inverters.jpg",
		name: "Inverters",
		blurb:
			"Pure sine wave and hybrid inverters, from small shop setups to full homes.",
	},
	{
		id: "batteries",
		image: "/images/batteries.jpg",
		name: "Batteries",
		blurb:
			"Lithium, tubular or gel. Not sure which one you need? We'll tell you honestly.",
	},
	{
		id: "panels",
		image: "/images/panels.jpg",
		name: "Solar Panels",
		blurb: "Strong mono panels to keep your batteries full.",
	},
	{
		id: "packages",
		image: "/images/packages.jpg",
		name: "Full Packages",
		blurb: "Inverter, battery, panels and installation, all for one price.",
	},
];

export function getCategory(id: CategoryId) {
	return categories.find((c) => c.id === id);
}

export function isCategoryId(value: unknown): value is CategoryId {
	return categories.some((c) => c.id === value);
}

export const videos = [
	{ id: "7653944722368580882", title: "Solar generators that can power AC" },
	{ id: "7484587941730290999", title: "5kVA + 5kWh lithium installation" },
	{ id: "7448210880581487877", title: "4 tubular batteries vs 10kWh lithium" },
	{ id: "7431187991860612357", title: "300W generator running Starlink" },
];
