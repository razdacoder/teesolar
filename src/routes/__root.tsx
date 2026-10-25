import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ArrowLeft } from "lucide-react";
import { SiteFooter, SiteHeader } from "#/components/site-chrome";
import { FloatingWhatsApp } from "#/components/whatsapp-button";
import type { RouterContext } from "#/router";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{
				title:
					"Tee Solar Inverters | Solar generators, inverters & batteries in Lagos",
			},
			{
				name: "description",
				content:
					"Solar generators, inverters, batteries and panels, sold and installed by Tee Solar at DarlingTee Mall, Ijegun, Lagos. Chat with us on WhatsApp for today's prices.",
			},
			{ name: "theme-color", content: "#2b3190" },
		],
		links: [
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
			},
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", type: "image/png", href: "/favicon.png" },
			{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	// The admin panel has its own chrome.
	const inAdmin = useRouterState({
		select: (s) => s.location.pathname.startsWith("/admin"),
	});

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{inAdmin ? (
					children
				) : (
					<>
						<SiteHeader />
						<main>{children}</main>
						<SiteFooter />
						<FloatingWhatsApp />
					</>
				)}
				<TanStackDevtools
					// Left in the shop (WhatsApp is on the right); right in the admin, clear of the sidebar.
					config={{ position: inAdmin ? "bottom-right" : "bottom-left" }}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

function NotFound() {
	return (
		<div className="flex min-h-[70svh] flex-col justify-end px-4 pb-16 md:px-8">
			<p className="label text-mute">Error 404</p>
			<h1 className="display mt-4 text-[18vw]">No light</h1>
			<p className="mt-4 text-lg text-mute">
				Even the Solar Merlin couldn't find this page.
			</p>
			<Link to="/" className="label mt-8 flex items-center gap-2 underline">
				<ArrowLeft className="size-4" aria-hidden="true" /> Back to home
			</Link>
		</div>
	);
}
