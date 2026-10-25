import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { legal, site, whatsappLink } from "#/data/site";
import { WhatsAppIcon } from "./icons";

const nav = [
	{ to: "/products", label: "Shop" },
	{ to: "/packages", label: "Packages" },
	{ to: "/calculator", label: "Calculator" },
	{ to: "/about", label: "About" },
	{ to: "/contact", label: "Visit" },
] as const;

const legalLinks = [
	{ to: "/privacy", label: "Privacy policy" },
	{ to: "/terms", label: "Terms of sale" },
] as const;

function Logo({ light = false }: { light?: boolean }) {
	return (
		<Link to="/" className="shrink-0" aria-label={`${site.name} home`}>
			<img
				src={light ? "/brand/logo-light.png" : "/brand/logo.png"}
				alt={site.name}
				className="h-12 w-auto md:h-14"
			/>
		</Link>
	);
}

export function SiteHeader() {
	const [open, setOpen] = useState(false);
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	const [scrolled, setScrolled] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: close the menu on navigation
	useEffect(() => setOpen(false), [pathname]);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 40);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// On the home page the bar floats over the hero photo until the visitor scrolls.
	const overlay = pathname === "/" && !scrolled && !open;

	return (
		<header
			className={`sticky top-0 z-30 border-b transition-colors duration-300 ${
				overlay
					? "border-transparent bg-transparent text-white"
					: "border-ink bg-paper text-ink"
			}`}
		>
			<div className="flex h-18 items-center justify-between gap-6 px-4 md:h-20 md:px-8">
				<Logo light={overlay} />
				<nav className="hidden h-full items-center gap-10 md:flex">
					{nav.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							className="flex h-full items-center border-b-2 border-transparent text-sm font-semibold tracking-wide uppercase transition-colors hover:border-current"
							activeProps={{ className: "border-sun!" }}
						>
							{item.label}
						</Link>
					))}
				</nav>
				<a
					href={whatsappLink("Hi Tee Solar, I'd like to ask about solar.")}
					target="_blank"
					rel="noreferrer"
					className={`label hidden h-11 items-center gap-2 px-5 transition-colors md:inline-flex ${
						overlay
							? "bg-white text-ink hover:bg-sun"
							: "bg-ink text-paper hover:bg-ink/85"
					}`}
				>
					<WhatsAppIcon className="size-4" /> WhatsApp
					<ArrowUpRight className="size-4" aria-hidden="true" />
				</a>
				<button
					type="button"
					onClick={() => setOpen((v) => !v)}
					className="label inline-flex h-11 items-center gap-2 border border-current px-4 md:hidden"
					aria-expanded={open}
					aria-controls="mobile-nav"
				>
					{open ? (
						<X className="size-4" aria-hidden="true" />
					) : (
						<Menu className="size-4" aria-hidden="true" />
					)}
					{open ? "Close" : "Menu"}
				</button>
			</div>
			{open && (
				<nav
					id="mobile-nav"
					className="fixed inset-x-0 top-18 bottom-0 flex flex-col justify-between bg-paper px-4 pb-8 md:hidden"
				>
					<div>
						{nav.map((item) => (
							<Link
								key={item.to}
								to={item.to}
								className="display flex items-center justify-between border-b border-line py-5 text-5xl"
								activeProps={{ className: "text-mute" }}
							>
								{item.label}
								<ArrowRight className="size-7" aria-hidden="true" />
							</Link>
						))}
					</div>
					<div className="grid gap-2">
						<a
							href={whatsappLink("Hi Tee Solar, I'd like to ask about solar.")}
							target="_blank"
							rel="noreferrer"
							className="label inline-flex h-12 items-center justify-center gap-2 bg-ink text-paper"
						>
							<WhatsAppIcon className="size-4" /> Chat on WhatsApp
						</a>
						<a
							href={`tel:${site.phoneTel}`}
							className="label inline-flex h-12 items-center justify-center gap-2 border border-ink"
						>
							<Phone className="size-4" aria-hidden="true" /> Call{" "}
							{site.phoneDisplay}
						</a>
					</div>
				</nav>
			)}
		</header>
	);
}

export function SiteFooter() {
	return (
		<footer className="mt-32 bg-ink text-paper">
			<div className="grid gap-10 px-4 pt-16 sm:grid-cols-3 md:grid-cols-5 md:px-8">
				<div className="sm:col-span-3 md:col-span-2">
					<img
						src="/brand/logo-light.png"
						alt={site.name}
						className="h-20 w-auto"
					/>
					<p className="mt-5 max-w-sm text-lg leading-snug">
						We sell and install solar generators, inverters, batteries and
						panels in Lagos. {site.motto}.
					</p>
				</div>
				<div className="space-y-2">
					<p className="label text-paper/50">Explore</p>
					{nav.map((item) => (
						<Link key={item.to} to={item.to} className="block hover:text-sun">
							{item.label}
						</Link>
					))}
				</div>
				<div className="space-y-2">
					<p className="label text-paper/50">Legal</p>
					{legalLinks.map((item) => (
						<Link key={item.to} to={item.to} className="block hover:text-sun">
							{item.label}
						</Link>
					))}
				</div>
				<div className="space-y-2">
					<p className="label text-paper/50">Reach us</p>
					<a href={`tel:${site.phoneTel}`} className="block hover:text-sun">
						{site.phoneDisplay}
					</a>
					<p>{site.address}</p>
					<a
						href={site.social.tiktok}
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-1 hover:text-sun"
					>
						TikTok <ArrowUpRight className="size-4" aria-hidden="true" />
					</a>
					<a
						href={site.social.phones}
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-1 hover:text-sun"
					>
						DarlingTee Phones{" "}
						<ArrowUpRight className="size-4" aria-hidden="true" />
					</a>
				</div>
			</div>
			<div className="mt-16 overflow-hidden select-none" aria-hidden="true">
				<div className="flex w-max animate-marquee-slow">
					{[0, 1].map((copy) => (
						<span
							key={copy}
							className="display flex items-center pr-[6vw] text-[21vw] whitespace-nowrap text-paper/95"
						>
							Tee Solar
							<span className="ml-[6vw] size-[3vw] rounded-full bg-sun" />
						</span>
					))}
				</div>
			</div>
			<div className="label flex flex-col justify-between gap-2 border-t border-paper/15 px-4 py-5 text-paper/50 md:flex-row md:px-8">
				<span>
					© {new Date().getFullYear()} {legal.company} ({legal.rcNumber}),
					trading as {site.name}
				</span>
				<span>Prices change often, so check with us before you pay.</span>
			</div>
		</footer>
	);
}
