import type { CategoryId } from "#/data/products";

type IconProps = { className?: string };

export function SunIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			className={className}
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="4.5" fill="currentColor" />
			<g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
				<path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
			</g>
		</svg>
	);
}

export function WhatsAppIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z" />
		</svg>
	);
}

export function PhoneIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			className={className}
			aria-hidden="true"
		>
			<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
		</svg>
	);
}

export function PinIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			className={className}
			aria-hidden="true"
		>
			<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
			<circle cx="12" cy="10" r="2.5" />
		</svg>
	);
}

const categoryShapes: Record<CategoryId, React.ReactNode> = {
	"solar-generators": (
		<>
			<rect x="8" y="14" width="32" height="24" rx="4" />
			<path d="M16 14v-4h16v4M26 20l-5 7h6l-5 7" />
		</>
	),
	inverters: (
		<>
			<rect x="10" y="6" width="28" height="36" rx="3" />
			<rect x="16" y="12" width="16" height="8" rx="1" />
			<path d="M18 30c2-4 4 4 6 0s4 4 6 0" />
		</>
	),
	batteries: (
		<>
			<rect x="8" y="12" width="30" height="24" rx="3" />
			<path d="M38 20h3v8h-3M14 24h6M17 21v6M26 24h6" />
		</>
	),
	panels: (
		<path d="M10 10h28l4 22H6l4-22ZM8 21h32M19 10l-2 22M29 10l2 22M24 32v8M16 40h16" />
	),
	packages: (
		<>
			<path d="M6 24 24 8l18 16M10 21v19h28V21" />
			<path d="M20 40V30h8v10M16 18l4-4" />
		</>
	),
};

export function CategoryIcon({
	id,
	className,
}: IconProps & { id: CategoryId }) {
	return (
		<svg
			viewBox="0 0 48 48"
			fill="none"
			stroke="currentColor"
			strokeWidth={2.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			{categoryShapes[id]}
		</svg>
	);
}
