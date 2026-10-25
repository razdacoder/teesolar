import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	ArrowUpRight,
	Handshake,
	Store,
	Wrench,
	Zap,
} from "lucide-react";
import { WhatsAppButton } from "#/components/whatsapp-button";
import { legal, site } from "#/data/site";

export const Route = createFileRoute("/about")({
	head: () => ({
		meta: [
			{ title: "About us | Tee Solar Inverters" },
			{
				name: "description",
				content:
					"Tee Solar Inverters & Power Company sells and installs solar generators, inverters, batteries and panels from DarlingTee Mall, Ijegun, Lagos.",
			},
		],
	}),
	component: About,
});

const promises = [
	{
		icon: Handshake,
		title: "Honest sizing",
		body: "Tell us your budget and what you want to run. We'll recommend what fits, even when that's the smaller, cheaper option.",
	},
	{
		icon: Store,
		title: "See it before you pay",
		body: "Come into the shop, look at the units up close and ask us anything. No pressure.",
	},
	{
		icon: Wrench,
		title: "Installed by our own team",
		body: "We deliver, mount and wire everything ourselves, then show you how to use it.",
	},
	{
		icon: Zap,
		title: "Here after the sale",
		body: "New products come with a one-year warranty, and you can always reach us on the same number you bought from.",
	},
];

function About() {
	return (
		<div className="px-4 pt-12 md:px-8">
			<p className="label text-mute">About us</p>
			<h1 className="display mt-4 text-[15vw] md:text-[9vw]">
				Reliable.
				<br />
				Rest assured.
			</h1>

			<div className="mt-16 grid gap-12 border-t border-ink pt-10 lg:grid-cols-2">
				<div className="space-y-5 text-lg">
					<p>
						If you live in Lagos, you know the routine. The light goes, the
						generator comes on, and your fuel money disappears. Tee Solar exists
						to get homes and businesses out of that cycle for good.
					</p>
					<p>
						We sell and install solar generators, inverters, batteries and
						panels from our shop at DarlingTee Mall in Ijegun. Whether you need
						a small unit to keep the Wi-Fi and fans going or a full system for
						the house, we'll help you pick the right size and then set it up for
						you.
					</p>
					<p>
						Tee Solar is the solar side of {legal.company}, the same family as
						DarlingTee Phones.
					</p>
				</div>

				<div className="bg-sun p-8">
					<p className="label">A word about the boss</p>
					<p className="mt-4 text-2xl leading-snug font-medium">
						On TikTok he calls himself the Solar Merlin. We've stopped arguing.
						He's yet to pull a rabbit out of a hat, but he can definitely make a
						generator disappear.
					</p>
					<a
						href={site.social.tiktok}
						target="_blank"
						rel="noreferrer"
						className="label mt-6 flex items-center gap-1 underline"
					>
						Watch him on TikTok{" "}
						<ArrowUpRight className="size-4" aria-hidden="true" />
					</a>
				</div>
			</div>

			<section className="pt-32">
				<h2 className="display text-5xl md:text-7xl">
					What you can
					<br />
					count on
				</h2>
				<div className="mt-10 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
					{promises.map((p) => (
						<div key={p.title} className="bg-card p-8">
							<p.icon className="size-7 text-ink" aria-hidden="true" />
							<h3 className="mt-10 text-xl font-medium">{p.title}</h3>
							<p className="mt-2 text-mute">{p.body}</p>
						</div>
					))}
				</div>
			</section>

			<section className="grid gap-12 pt-32 lg:grid-cols-2">
				<div>
					<h2 className="display text-5xl md:text-7xl">
						Come say
						<br />
						hello
					</h2>
					<p className="mt-6 max-w-md text-lg text-mute">
						The easiest way to reach us is WhatsApp. Send us what you want to
						power and we'll take it from there.
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-6">
						<WhatsAppButton message="Hi Tee Solar, I found you on your website and I'd like some advice.">
							Chat with us
						</WhatsAppButton>
						<Link
							to="/contact"
							className="label flex items-center gap-2 underline"
						>
							Directions to the shop{" "}
							<ArrowRight className="size-4" aria-hidden="true" />
						</Link>
					</div>
				</div>

				<dl className="border-t border-ink text-sm">
					<Detail label="Trading name" value={site.name} />
					<Detail label="Company" value={legal.company} />
					<Detail label="Registration" value={legal.rcNumber} />
					<Detail label="Shop" value={site.address} />
					<Detail label="Phone & WhatsApp" value={site.phoneDisplay} />
					{legal.email && <Detail label="Email" value={legal.email} />}
				</dl>
			</section>
		</div>
	);
}

function Detail({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between gap-6 border-b border-line py-4">
			<dt className="label shrink-0 text-mute">{label}</dt>
			<dd className="text-right">{value}</dd>
		</div>
	);
}
