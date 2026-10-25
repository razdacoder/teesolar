// Seeds the catalog gathered from @teesolarinverter TikTok posts (late 2024 – 2026).
// Run with `pnpm db:seed`. Existing products (matched by slug) are left alone, so it's
// safe to re-run after adding products from the admin page.
import { db } from "./index";
import { type NewProduct, products } from "./schema";

const catalog: NewProduct[] = [
	// Solar generators
	{
		slug: "lutian-3000w-solar-generator",
		output: 3000,
		name: "Lutian 3000W Solar Generator",
		brand: "Lutian",
		category: "solar-generators",
		summary:
			"The biggest unit in Lutian's new range. Plenty of power for a busy home.",
		highlights: ["3000W output", "Solar & grid charging", "Portable"],
		price: null,
		featured: true,
		video: "7648404462540705042",
	},
	{
		slug: "itel-power-tank-1000",
		output: 1000,
		storage: 2,
		name: "itel Power Tank 1000",
		brand: "itel",
		category: "solar-generators",
		summary:
			"Keeps your lights, fans, TV, laptop and Wi-Fi going when the light goes off. Quiet, and no fuel to buy.",
		highlights: ["1000W output", "2kWh battery", "Quiet, fuel-free"],
		price: 285000,
		featured: true,
	},
	{
		slug: "meco-2kwh-solar-generator",
		name: "Meco 2kWh Solar Generator",
		brand: "Meco",
		category: "solar-generators",
		summary:
			"A solid everyday backup for the home. Charge it from solar or NEPA and stop buying fuel.",
		highlights: ["2kWh battery", "Solar & grid charging", "Portable"],
		price: null,
	},
	{
		slug: "colar-3600-solar-generator",
		name: "Colar 3600 Solar Generator",
		brand: "Colar",
		category: "solar-generators",
		summary:
			"Easy to move around, needs almost no maintenance, and the battery lasts. Good backup for when the light goes.",
		highlights: ["Portable", "Low maintenance", "Long battery life"],
		price: null,
		featured: true,
		video: "7611828065135627538",
	},
	{
		slug: "hicces-3kva-5kwh-all-in-one",
		output: 2400,
		storage: 5,
		name: "Hicces All-in-One 3kVA / 5kWh",
		brand: "Hicces",
		category: "solar-generators",
		summary:
			"Inverter and lithium battery in one neat cabinet. It sits against the wall with no loose wires.",
		highlights: ["3kVA inverter", "5kWh lithium", "All-in-one unit"],
		price: null,
	},
	{
		slug: "hicces-3kva-7kwh-all-in-one",
		output: 2400,
		storage: 7,
		name: "Hicces All-in-One 3kVA / 7kWh",
		brand: "Hicces",
		category: "solar-generators",
		summary:
			"The same all-in-one cabinet with a bigger battery, for longer nights.",
		highlights: ["3kVA inverter", "7kWh lithium", "All-in-one unit"],
		price: null,
	},
	{
		slug: "1800w-solar-generator",
		output: 1800,
		name: "1,800W Solar Generator",
		category: "solar-generators",
		summary: "A strong everyday power station, and we've cut the price.",
		highlights: ["1,800W output", "Solar & grid charging"],
		price: 880000,
		oldPrice: 1100000,
		featured: true,
		video: "7462824328631979269",
	},
	{
		slug: "300w-starlink-solar-generator",
		output: 300,
		name: "300W Solar Generator",
		category: "solar-generators",
		summary:
			"Small enough to carry anywhere. Runs your Starlink, your phones and a few bulbs.",
		highlights: ["300W output", "Runs Starlink", "Carry anywhere"],
		price: null,
		video: "7431187991860612357",
	},
	{
		slug: "qasa-spg-500",
		output: 500,
		name: "Qasa SPG 500",
		brand: "Qasa",
		category: "solar-generators",
		summary:
			"A small pure sine wave generator for small money. A good first step away from fuel.",
		highlights: ["Pure sine wave", "Great first buy", "Portable"],
		price: 65000,
		video: "7399018557050309893",
	},

	// Inverters
	{
		slug: "5kva-48v-hybrid-inverter",
		name: "5kVA 48V Hybrid Inverter",
		category: "inverters",
		summary:
			"A hard-working hybrid inverter for a full home or office. Runs on solar and NEPA.",
		highlights: ["5kVA", "48V system", "Solar + grid hybrid"],
		price: 550000,
	},
	{
		slug: "felicity-hybrid-inverter",
		name: "Felicity Hybrid Inverter",
		brand: "Felicity",
		category: "inverters",
		summary:
			"Felicity hybrid inverters in different sizes. Tell us your load and we'll pick the right one.",
		highlights: ["Pure sine wave", "Built-in MPPT", "Several sizes"],
		price: null,
	},
	{
		slug: "fairly-used-3-5kva-inverter",
		name: "3.5kVA Inverter (Fairly Used)",
		category: "inverters",
		condition: "fairly used",
		summary:
			"A fairly used 3.5kVA that we've tested ourselves. Great for a shop or small business on a budget.",
		highlights: ["3.5kVA", "Tested before sale", "Budget friendly"],
		price: null,
		video: "7448944003409661190",
	},

	// Batteries
	{
		slug: "5kwh-lithium-battery",
		name: "5kWh Lithium Battery",
		category: "batteries",
		summary: "Lasts much longer than a tubular battery and weighs a lot less.",
		highlights: ["5kWh", "Deep cycle", "Thousands of cycles"],
		price: null,
		video: "7484587941730290999",
	},
	{
		slug: "10kwh-lithium-battery",
		name: "10kWh Lithium Battery",
		category: "batteries",
		summary: "Enough storage to carry a home through the night.",
		highlights: ["10kWh", "Deep cycle", "Whole-home backup"],
		price: null,
		video: "7448210880581487877",
	},
	{
		slug: "tubular-battery",
		name: "Tubular Battery",
		category: "batteries",
		summary:
			"The battery most people know. Affordable, tried and tested, and easy to replace. Join two to four for a bigger setup.",
		highlights: ["Affordable", "Tried and tested", "Easy to replace"],
		price: null,
	},
	{
		slug: "gel-battery",
		name: "Gel Battery",
		category: "batteries",
		summary:
			"Sealed and maintenance-free, so no topping up water. Best for small inverters.",
		highlights: ["Maintenance free", "Sealed", "Small systems"],
		price: null,
		video: "7460045401878482182",
	},

	// Panels
	{
		slug: "550w-mono-panel",
		name: "550W Mono Solar Panel",
		category: "panels",
		summary: "A strong mono panel that keeps your batteries charged.",
		highlights: ["550W", "Monocrystalline"],
		price: null,
	},
	{
		slug: "600w-mono-panel",
		name: "600W Mono Solar Panel",
		category: "panels",
		summary: "The panel we use most in our hybrid setups.",
		highlights: ["600W", "Monocrystalline"],
		price: null,
	},

	// Packages
	{
		slug: "starter-150w-package",
		output: 150,
		storage: 0.24,
		name: "Starter Package (150W)",
		category: "packages",
		summary:
			"A 150W inverter with a 20A gel battery. Enough for a bulb, a fan and phone charging.",
		highlights: ["150W inverter", "20A gel battery"],
		price: 200000,
	},
	{
		slug: "4-2kva-8kwh-package",
		output: 3360,
		storage: 8,
		name: "4.2kVA Home Package",
		brand: "Haisic",
		category: "packages",
		summary:
			"A 4.2kVA hybrid inverter, an 8kWh lithium battery and six 600W panels. A popular choice for family homes.",
		highlights: ["4.2kVA hybrid", "8kWh lithium", "6 × 600W panels"],
		price: 2200000,
		featured: true,
	},
	{
		slug: "6kva-5kwh-package",
		output: 4800,
		storage: 5,
		name: "6kVA Hybrid Package",
		category: "packages",
		summary:
			"A 6kVA hybrid inverter, a 5kWh lithium battery, six 600W panels and everything needed to install them.",
		highlights: [
			"6kVA hybrid",
			"5kWh lithium",
			"6 × 600W panels",
			"Installation kit",
		],
		price: 2600000,
	},
	{
		slug: "5kva-10kwh-package",
		output: 4000,
		storage: 10,
		name: "5kVA Full Home Package",
		category: "packages",
		summary:
			"A 5kVA 48V inverter, a 10kWh lithium battery and eight 550W panels. We deliver it and install it for you.",
		highlights: [
			"5kVA 48V",
			"10kWh lithium",
			"8 × 550W panels",
			"Installation & delivery",
		],
		price: 4700000,
		featured: true,
		video: "7484587941730290999",
	},
];

const inserted = await db
	.insert(products)
	.values(catalog)
	.onConflictDoNothing({ target: products.slug })
	.returning({ slug: products.slug });

console.log(`Seeded ${inserted.length} of ${catalog.length} products.`);
await db.$client.end();
