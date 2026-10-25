import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { reasonInfo } from "#/components/admin/stock-form";
import {
	Card,
	dateTime,
	Empty,
	PageHeader,
	Quantity,
	Select,
} from "#/components/admin/ui";
import { stockReasonEnum } from "#/db/schema";
import { adminProductsQuery, ledgerQuery } from "#/queries/products";

const searchSchema = z.object({
	productId: z.uuid().optional().catch(undefined),
	reason: z.enum(stockReasonEnum.enumValues).optional().catch(undefined),
	page: z.int().positive().optional().catch(undefined),
});

export const Route = createFileRoute("/admin/stock")({
	validateSearch: searchSchema,
	loaderDeps: ({ search }) => search,
	loader: ({ context: { queryClient }, deps }) =>
		Promise.all([
			queryClient.ensureQueryData(ledgerQuery(deps)),
			queryClient.ensureQueryData(adminProductsQuery()),
		]),
	component: StockHistory,
});

function StockHistory() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const { data: products } = useSuspenseQuery(adminProductsQuery());
	// Not suspense: keeps the previous page on screen while the next one loads.
	const { data: ledger, isFetching } = useQuery(ledgerQuery(search));
	const page = search.page ?? 1;

	const setSearch = (next: Partial<z.infer<typeof searchSchema>>) =>
		navigate({ search: (s) => ({ ...s, page: undefined, ...next }) });

	return (
		<div className="grid gap-6">
			<PageHeader
				title="Stock history"
				description="Every restock, sale, return and adjustment, newest first."
			/>

			<div className="grid gap-2 sm:grid-cols-[1fr_14rem]">
				<Select
					aria-label="Product"
					value={search.productId ?? ""}
					onChange={(e) =>
						setSearch({ productId: e.target.value || undefined })
					}
				>
					<option value="">All products</option>
					{products.map((p) => (
						<option key={p.id} value={p.id}>
							{p.name}
						</option>
					))}
				</Select>
				<Select
					aria-label="Reason"
					value={search.reason ?? ""}
					onChange={(e) =>
						setSearch({
							reason: (e.target.value || undefined) as typeof search.reason,
						})
					}
				>
					<option value="">All reasons</option>
					{stockReasonEnum.enumValues.map((r) => (
						<option key={r} value={r}>
							{reasonInfo[r].label}
						</option>
					))}
				</Select>
			</div>

			<Card
				className={`overflow-x-auto transition-opacity ${isFetching ? "opacity-60" : ""}`}
			>
				{!ledger || ledger.rows.length === 0 ? (
					<Empty>Nothing recorded yet.</Empty>
				) : (
					<table className="w-full min-w-[720px] text-left text-sm">
						<thead className="border-b border-line">
							<tr className="label text-mute">
								<th className="px-5 py-3 font-normal">When</th>
								<th className="px-3 py-3 font-normal">Product</th>
								<th className="px-3 py-3 font-normal">Reason</th>
								<th className="px-3 py-3 font-normal">Note</th>
								<th className="px-3 py-3 font-normal">By</th>
								<th className="px-5 py-3 text-right font-normal">Change</th>
							</tr>
						</thead>
						<tbody>
							{ledger.rows.map((m) => (
								<tr key={m.id} className="border-b border-line last:border-0">
									<td className="px-5 py-3 whitespace-nowrap text-mute">
										{dateTime.format(new Date(m.createdAt))}
									</td>
									<td className="px-3 py-3">
										<Link
											to="/admin/products/$id"
											params={{ id: m.productId }}
											className="hover:underline"
										>
											{m.productName}
										</Link>
									</td>
									<td className="px-3 py-3">{reasonInfo[m.reason].label}</td>
									<td className="max-w-xs truncate px-3 py-3 text-mute">
										{m.note}
									</td>
									<td className="px-3 py-3 text-mute">
										{m.userName ?? "Removed user"}
									</td>
									<td className="px-5 py-3 text-right">
										<Quantity value={m.quantity} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</Card>

			{ledger && ledger.pages > 1 && (
				<nav className="flex items-center justify-between text-sm">
					<p className="text-mute">
						Page {page} of {ledger.pages} · {ledger.total} records
					</p>
					<div className="flex gap-2">
						<Link
							from={Route.fullPath}
							search={(s) => ({ ...s, page: page - 1 })}
							disabled={page <= 1}
							className="label inline-flex h-8 items-center border border-line bg-card px-3 hover:border-ink aria-disabled:opacity-40"
						>
							Previous
						</Link>
						<Link
							from={Route.fullPath}
							search={(s) => ({ ...s, page: page + 1 })}
							disabled={page >= ledger.pages}
							className="label inline-flex h-8 items-center border border-line bg-card px-3 hover:border-ink aria-disabled:opacity-40"
						>
							Next
						</Link>
					</div>
				</nav>
			)}
		</div>
	);
}
