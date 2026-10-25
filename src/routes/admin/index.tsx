import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { reasonInfo } from "#/components/admin/stock-form";
import {
	Badge,
	Card,
	dateTime,
	Empty,
	PageHeader,
	Quantity,
} from "#/components/admin/ui";
import { useAdmin } from "#/components/admin/use-admin";
import { formatNaira } from "#/data/site";
import { dashboardQuery } from "#/queries/products";

export const Route = createFileRoute("/admin/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(dashboardQuery()),
	component: Dashboard,
});

function Dashboard() {
	const { user, can } = useAdmin();
	const { data } = useSuspenseQuery(dashboardQuery());

	return (
		<div className="grid gap-8">
			<PageHeader
				title={`Hello, ${user.name.split(" ")[0]}`}
				description="Here's how the shop is doing."
				actions={
					can({ product: ["create"] }) && (
						<Link
							to="/admin/products/new"
							className="label inline-flex h-10 items-center gap-2 bg-ink px-4 text-paper hover:bg-ink/85"
						>
							<Plus className="size-4" aria-hidden="true" /> New product
						</Link>
					)
				}
			/>

			<div className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
				<Stat
					label="Products"
					value={data.products}
					detail={`${data.hidden} hidden`}
				/>
				<Stat label="Units in stock" value={data.units} />
				<Stat
					label="Out of stock"
					value={data.outOfStock}
					tone={data.outOfStock > 0 ? "warn" : undefined}
				/>
				<Stat label="Sold, last 30 days" value={data.soldLast30Days} />
				<Stat
					label="Stock value"
					value={formatNaira(data.value)}
					detail="Priced items only"
					className="col-span-2 lg:col-span-4"
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card
					title="Running low"
					actions={
						<Link
							to="/admin/products"
							className="label text-mute hover:text-ink"
						>
							All products
						</Link>
					}
				>
					{data.low.length === 0 ? (
						<Empty>Everything is well stocked.</Empty>
					) : (
						<ul>
							{data.low.map((p) => (
								<li key={p.id} className="border-b border-line last:border-0">
									<Link
										to="/admin/products/$id"
										params={{ id: p.id }}
										className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-paper"
									>
										<span className="truncate text-sm">{p.name}</span>
										<Badge tone={p.stock === 0 ? "red" : "sun"}>
											{p.stock === 0 ? "Out" : `${p.stock} left`}
										</Badge>
									</Link>
								</li>
							))}
						</ul>
					)}
				</Card>

				<Card
					title="Latest stock changes"
					actions={
						<Link to="/admin/stock" className="label text-mute hover:text-ink">
							Full history
						</Link>
					}
				>
					{data.recent.length === 0 ? (
						<Empty>No stock recorded yet.</Empty>
					) : (
						<ul>
							{data.recent.map((m) => (
								<li
									key={m.id}
									className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 last:border-0"
								>
									<div className="min-w-0">
										<Link
											to="/admin/products/$id"
											params={{ id: m.productId }}
											className="block truncate text-sm hover:underline"
										>
											{m.productName}
										</Link>
										<p className="text-xs text-mute">
											{reasonInfo[m.reason].label} ·{" "}
											{m.userName ?? "Removed user"} ·{" "}
											{dateTime.format(new Date(m.createdAt))}
										</p>
									</div>
									<Quantity value={m.quantity} />
								</li>
							))}
						</ul>
					)}
				</Card>
			</div>
		</div>
	);
}

function Stat({
	label,
	value,
	detail,
	tone,
	className = "",
}: {
	label: string;
	value: number | string;
	detail?: string;
	tone?: "warn";
	className?: string;
}) {
	return (
		<div className={`bg-card p-5 ${className}`}>
			<p className="label text-mute">{label}</p>
			<p
				className={`mt-2 text-3xl font-semibold tracking-tight ${tone === "warn" ? "text-red-700" : ""}`}
			>
				{value}
			</p>
			{detail && <p className="mt-1 text-xs text-mute">{detail}</p>}
		</div>
	);
}
