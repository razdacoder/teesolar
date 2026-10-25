import { useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import {
	ArrowUpRight,
	Boxes,
	History,
	LayoutDashboard,
	LogOut,
	Menu,
	UserRound,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";
import { useAdmin } from "#/components/admin/use-admin";
import { authClient } from "#/lib/auth-client";
import { isRole, type Permissions, roleInfo } from "#/lib/permissions";
import { sessionQuery } from "#/queries/users";

export const Route = createFileRoute("/admin")({
	beforeLoad: async ({ context, location }) => {
		const user = await context.queryClient.ensureQueryData(sessionQuery());
		if (!user) {
			throw redirect({
				to: "/admin/login",
				search: { redirect: location.href },
			});
		}
		return { user };
	},
	head: () => ({
		meta: [
			{ title: "Admin | Tee Solar" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: AdminLayout,
});

const nav: {
	to: string;
	label: string;
	icon: typeof Boxes;
	exact?: boolean;
	needs?: Permissions;
}[] = [
	{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
	{ to: "/admin/products", label: "Products", icon: Boxes },
	{ to: "/admin/stock", label: "Stock history", icon: History },
	{
		to: "/admin/users",
		label: "Users",
		icon: Users,
		needs: { user: ["list"] },
	},
	{ to: "/admin/account", label: "Your account", icon: UserRound },
];

function AdminLayout() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	// Remember which page the menu was opened on, so navigating closes it.
	const [openOn, setOpenOn] = useState<string | null>(null);
	const open = openOn === pathname;
	const setOpen = (next: boolean) => setOpenOn(next ? pathname : null);

	return (
		<div className="min-h-svh bg-paper text-ink lg:grid lg:grid-cols-[15rem_1fr]">
			<header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper px-4 lg:hidden">
				<Brand />
				<button
					type="button"
					onClick={() => setOpen(!open)}
					aria-label={open ? "Close menu" : "Open menu"}
					aria-expanded={open}
				>
					{open ? <X className="size-5" /> : <Menu className="size-5" />}
				</button>
			</header>

			<aside
				className={`fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-line bg-card lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-auto ${open ? "flex" : "hidden"}`}
			>
				<div className="hidden h-16 items-center border-b border-line px-5 lg:flex">
					<Brand />
				</div>
				<Sidebar />
			</aside>
			{open && (
				<button
					type="button"
					aria-label="Close menu"
					onClick={() => setOpen(false)}
					className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
				/>
			)}

			<main className="min-w-0 px-4 py-8 md:px-8 lg:py-10">
				<div className="mx-auto max-w-6xl">
					<Outlet />
				</div>
			</main>
		</div>
	);
}

function Brand() {
	return (
		<Link to="/admin" className="flex items-center gap-2">
			<img src="/brand/mark.png" alt="" className="size-8" />
			<span className="font-semibold">Tee Solar</span>
			<span className="label text-mute">Admin</span>
		</Link>
	);
}

function Sidebar() {
	const { user, can } = useAdmin();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	async function signOut() {
		await authClient.signOut();
		queryClient.clear();
		navigate({ to: "/admin/login" });
	}

	return (
		<>
			<nav className="flex-1 overflow-y-auto p-3">
				<ul className="grid gap-1">
					{nav
						.filter((item) => !item.needs || can(item.needs))
						.map(({ to, label, icon: Icon, exact }) => (
							<li key={to}>
								<Link
									to={to}
									activeOptions={{ exact }}
									className="flex h-10 items-center gap-3 px-3 text-sm text-mute hover:bg-line/50 hover:text-ink"
									activeProps={{ className: "bg-ink !text-paper hover:bg-ink" }}
								>
									<Icon className="size-4" aria-hidden="true" />
									{label}
								</Link>
							</li>
						))}
				</ul>
				<a
					href="/"
					target="_blank"
					rel="noreferrer"
					className="mt-4 flex h-10 items-center gap-3 px-3 text-sm text-mute hover:text-ink"
				>
					<ArrowUpRight className="size-4" aria-hidden="true" />
					View the shop
				</a>
			</nav>
			<div className="border-t border-line p-3">
				<div className="px-3 py-2">
					<p className="truncate text-sm font-medium">{user.name}</p>
					<p className="truncate text-xs text-mute">
						{isRole(user.role) ? roleInfo[user.role].name : "No role"} ·{" "}
						{user.email}
					</p>
				</div>
				<button
					type="button"
					onClick={signOut}
					className="flex h-10 w-full items-center gap-3 px-3 text-sm text-mute hover:bg-line/50 hover:text-ink"
				>
					<LogOut className="size-4" aria-hidden="true" />
					Sign out
				</button>
			</div>
		</>
	);
}
