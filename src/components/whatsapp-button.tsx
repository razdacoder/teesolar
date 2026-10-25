import { useRouterState } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { whatsappLink } from "#/data/site";
import { WhatsAppIcon } from "./icons";

interface WhatsAppButtonProps {
	message: string;
	children?: React.ReactNode;
	variant?: "solid" | "outline" | "light";
	className?: string;
}

const variants = {
	solid: "bg-ink text-paper hover:bg-ink/85",
	outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
	light: "bg-paper text-ink hover:bg-sun",
};

export function WhatsAppButton({
	message,
	children = "Order on WhatsApp",
	variant = "solid",
	className = "",
}: WhatsAppButtonProps) {
	return (
		<a
			href={whatsappLink(message)}
			target="_blank"
			rel="noreferrer"
			className={`label inline-flex h-12 items-center justify-center gap-2 px-5 transition-colors ${variants[variant]} ${className}`}
		>
			<WhatsAppIcon className="size-4" />
			{children}
			<ArrowUpRight className="size-4" aria-hidden="true" />
		</a>
	);
}

// Appears once the visitor scrolls, so it never covers the hero's own buttons.
export function FloatingWhatsApp() {
	const [visible, setVisible] = useState(false);
	// The calculator has its own WhatsApp button and a mobile summary bar in this corner.
	const hidden = useRouterState({
		select: (s) => s.location.pathname === "/calculator",
	});

	useEffect(() => {
		const onScroll = () =>
			setVisible(window.scrollY > window.innerHeight * 0.6);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	if (hidden) return null;

	return (
		<a
			href={whatsappLink(
				"Hi Tee Solar, can you help me choose the right solar setup?",
			)}
			target="_blank"
			rel="noreferrer"
			aria-label="Ask the Solar Merlin on WhatsApp"
			title="Ask the Solar Merlin"
			tabIndex={visible ? 0 : -1}
			className={`fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full bg-whatsapp text-ink shadow-lg shadow-ink/20 transition duration-300 hover:scale-105 ${
				visible
					? "translate-y-0 opacity-100"
					: "pointer-events-none translate-y-4 opacity-0"
			}`}
		>
			<WhatsAppIcon className="size-7" />
		</a>
	);
}
