import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

/** Centered card for the sign-in and invite pages, outside the admin layout. */
export function AuthShell({
	title,
	description,
	children,
}: {
	title: string;
	description?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center bg-paper px-4 py-12 text-ink">
			<Link to="/" className="mb-8">
				<img src="/brand/logo.png" alt="Tee Solar" className="h-14 w-auto" />
			</Link>
			<div className="w-full max-w-sm border border-line bg-card p-6 sm:p-8">
				<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
				{description && <p className="mt-2 text-sm text-mute">{description}</p>}
				<div className="mt-6">{children}</div>
			</div>
		</div>
	);
}
