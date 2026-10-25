import {
	keepPreviousData,
	queryOptions,
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import {
	adjustStock,
	createProduct,
	deleteProduct,
	getDashboard,
	getProductById,
	getProductBySlug,
	type LedgerFilter,
	listAdminProducts,
	listProducts,
	listStockMovements,
	updateProduct,
} from "#/server/products";

export const productKeys = {
	all: ["products"] as const,
	list: () => [...productKeys.all, "list"] as const,
	detail: (slug: string) => [...productKeys.all, "detail", slug] as const,
	admin: () => [...productKeys.all, "admin"] as const,
	adminDetail: (id: string) => [...productKeys.admin(), "detail", id] as const,
	ledger: (filter: LedgerFilter) =>
		[...productKeys.admin(), "ledger", filter] as const,
	dashboard: () => [...productKeys.admin(), "dashboard"] as const,
};

// Public catalog (published products only)

export const productsQuery = () =>
	queryOptions({ queryKey: productKeys.list(), queryFn: () => listProducts() });

export const productQuery = (slug: string) =>
	queryOptions({
		queryKey: productKeys.detail(slug),
		queryFn: () => getProductBySlug({ data: { slug } }),
	});

/** The whole catalog. Routes that call this must load `productsQuery()` first. */
export function useProducts() {
	return useSuspenseQuery(productsQuery()).data;
}

// Admin

export const adminProductsQuery = () =>
	queryOptions({
		queryKey: productKeys.admin(),
		queryFn: () => listAdminProducts(),
	});

export const adminProductQuery = (id: string) =>
	queryOptions({
		queryKey: productKeys.adminDetail(id),
		queryFn: () => getProductById({ data: { id } }),
	});

export const ledgerQuery = (filter: LedgerFilter) =>
	queryOptions({
		queryKey: productKeys.ledger(filter),
		queryFn: () => listStockMovements({ data: filter }),
		placeholderData: keepPreviousData,
	});

export const dashboardQuery = () =>
	queryOptions({
		queryKey: productKeys.dashboard(),
		queryFn: () => getDashboard(),
	});

// Every write invalidates the whole products tree: the catalog is small, and it keeps
// the shop, the admin lists and the stock ledger from drifting apart.
function useProductMutation<TArgs, TResult>(
	fn: (args: TArgs) => Promise<TResult>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: fn,
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: productKeys.all }),
	});
}

export const useCreateProduct = () => useProductMutation(createProduct);
export const useUpdateProduct = () => useProductMutation(updateProduct);

export function useDeleteProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteProduct,
		onSuccess: (_, { data: { id } }) => {
			// The open edit page would refetch the deleted product and 404; drop it instead.
			const detail = productKeys.adminDetail(id);
			queryClient.removeQueries({ queryKey: detail, exact: true });
			return queryClient.invalidateQueries({
				queryKey: productKeys.all,
				predicate: (q) => q.queryKey.join() !== detail.join(),
			});
		},
	});
}
export const useAdjustStock = () => useProductMutation(adjustStock);
