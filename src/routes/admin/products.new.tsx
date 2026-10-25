import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "#/components/admin/product-form";
import { PageHeader } from "#/components/admin/ui";
import { can } from "#/lib/permissions";
import { useCreateProduct } from "#/queries/products";

export const Route = createFileRoute("/admin/products/new")({
	beforeLoad: ({ context }) => {
		if (!can(context.user.role, { product: ["create"] })) {
			throw redirect({ to: "/admin/products" });
		}
	},
	component: NewProduct,
});

function NewProduct() {
	const create = useCreateProduct();
	const navigate = Route.useNavigate();

	return (
		<div className="grid gap-8">
			<div>
				<Link
					to="/admin/products"
					className="label mb-4 inline-flex items-center gap-2 text-mute hover:text-ink"
				>
					<ArrowLeft className="size-3.5" aria-hidden="true" /> Products
				</Link>
				<PageHeader title="New product" />
			</div>
			<ProductForm
				submitLabel="Create product"
				pending={create.isPending}
				error={create.error}
				onSubmit={(values) =>
					create.mutate(
						{ data: values },
						{
							onSuccess: (product) =>
								navigate({
									to: "/admin/products/$id",
									params: { id: product.id },
								}),
						},
					)
				}
			/>
		</div>
	);
}
