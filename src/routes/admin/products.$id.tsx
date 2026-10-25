import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { ProductForm } from "#/components/admin/product-form";
import { reasonInfo, StockForm } from "#/components/admin/stock-form";
import {
	Badge,
	Card,
	ConfirmButton,
	dateTime,
	Empty,
	PageHeader,
	Quantity,
} from "#/components/admin/ui";
import { useAdmin } from "#/components/admin/use-admin";
import {
	adminProductQuery,
	ledgerQuery,
	useDeleteProduct,
	useUpdateProduct,
} from "#/queries/products";

export const Route = createFileRoute("/admin/products/$id")({
	loader: ({ context: { queryClient }, params }) =>
		Promise.all([
			queryClient.ensureQueryData(adminProductQuery(params.id)),
			queryClient.ensureQueryData(ledgerQuery({ productId: params.id })),
		]),
	component: EditProduct,
});

function EditProduct() {
	const { id } = Route.useParams();
	const navigate = Route.useNavigate();
	const { can } = useAdmin();
	const { data: product } = useSuspenseQuery(adminProductQuery(id));
	const { data: history } = useSuspenseQuery(ledgerQuery({ productId: id }));
	const update = useUpdateProduct();
	const remove = useDeleteProduct();
	const [saved, setSaved] = useState(false);
	const canEdit = can({ product: ["update"] });

	return (
		<div className="grid gap-8">
			<div>
				<Link
					to="/admin/products"
					className="label mb-4 inline-flex items-center gap-2 text-mute hover:text-ink"
				>
					<ArrowLeft className="size-3.5" aria-hidden="true" /> Products
				</Link>
				<PageHeader
					title={product.name}
					description={
						<span className="flex flex-wrap items-center gap-2">
							{product.published ? (
								<Badge tone="green">Live</Badge>
							) : (
								<Badge>Hidden</Badge>
							)}
							{product.published && (
								<a
									href={`/products/${product.slug}`}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-1 hover:text-ink"
								>
									View in shop{" "}
									<ArrowUpRight className="size-3.5" aria-hidden="true" />
								</a>
							)}
						</span>
					}
				/>
			</div>

			<div className="grid gap-8 xl:grid-cols-[1fr_22rem]">
				<div className="grid content-start gap-8">
					{!canEdit && (
						<p className="border border-line bg-card px-4 py-3 text-sm text-mute">
							You can record stock, but only managers and admins can edit
							product details.
						</p>
					)}
					<ProductForm
						// Remount after a save so the form shows what the server stored.
						key={product.updatedAt.toString()}
						product={product}
						readOnly={!canEdit}
						submitLabel="Save changes"
						pending={update.isPending}
						error={update.error}
						onSubmit={({ openingStock: _, ...values }) => {
							setSaved(false);
							update.mutate(
								{ data: { id, ...values } },
								{ onSuccess: () => setSaved(true) },
							);
						}}
					/>
					{saved && !update.isPending && (
						<output className="-mt-4 block text-sm text-emerald-700">
							Saved.
						</output>
					)}

					{can({ product: ["delete"] }) && (
						<Card title="Danger zone">
							<div className="flex flex-wrap items-center justify-between gap-4 p-5">
								<p className="max-w-md text-sm text-mute">
									Deleting removes the product and its whole stock history. To
									take it out of the shop but keep the history, untick “Show in
									the shop” instead.
								</p>
								<ConfirmButton
									variant="danger"
									title="Delete product?"
									message={
										<>
											<strong>{product.name}</strong> and its {history.total}{" "}
											stock records will be deleted. This can't be undone.
										</>
									}
									confirmLabel="Delete"
									pending={remove.isPending}
									error={remove.error}
									onConfirm={() =>
										remove
											.mutateAsync({ data: { id } })
											.then(() => navigate({ to: "/admin/products" }))
									}
								>
									Delete product
								</ConfirmButton>
							</div>
						</Card>
					)}
				</div>

				<div className="grid content-start gap-6">
					<Card title="Stock">
						<div className="p-5">
							<p className="text-4xl font-semibold tracking-tight">
								{product.stock}
								<span className="ml-2 text-base font-normal text-mute">
									units
								</span>
							</p>
							{can({ stock: ["adjust"] }) && (
								<div className="mt-5 border-t border-line pt-5">
									<StockForm productId={id} stock={product.stock} />
								</div>
							)}
						</div>
					</Card>

					<Card
						title="History"
						actions={
							history.total > history.rows.length && (
								<Link
									to="/admin/stock"
									search={{ productId: id }}
									className="label text-mute hover:text-ink"
								>
									All {history.total}
								</Link>
							)
						}
					>
						{history.rows.length === 0 ? (
							<Empty>No stock recorded yet.</Empty>
						) : (
							<ul className="max-h-[32rem] overflow-y-auto">
								{history.rows.map((m) => (
									<li
										key={m.id}
										className="flex items-start justify-between gap-4 border-b border-line px-5 py-3 last:border-0"
									>
										<div className="min-w-0 text-sm">
											<p>{reasonInfo[m.reason].label}</p>
											{m.note && <p className="text-mute">{m.note}</p>}
											<p className="text-xs text-mute">
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
		</div>
	);
}
