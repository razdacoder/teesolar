import { Link } from "@tanstack/react-router";
import { getCategory, type Product } from "#/data/products";
import { formatNaira } from "#/data/site";
import { ProductImage } from "./product-media";

export function Price({
	product,
	className = "",
}: {
	product: Product;
	className?: string;
}) {
	if (product.price === null) {
		return <span className={className}>Ask for price</span>;
	}
	return (
		<span className={`inline-flex items-baseline gap-2 ${className}`}>
			{formatNaira(product.price)}
			{product.oldPrice && (
				<s className="text-[0.75em] text-mute">
					{formatNaira(product.oldPrice)}
				</s>
			)}
		</span>
	);
}

export function ProductCard({ product }: { product: Product }) {
	return (
		<Link
			to="/products/$slug"
			params={{ slug: product.slug }}
			className="group flex h-full flex-col bg-card transition-colors hover:bg-white"
		>
			<div className="label flex justify-between gap-4 p-4 text-mute">
				<span>{product.brand ?? "Tee Solar"}</span>
				<span>
					{product.oldPrice
						? "Price slashed"
						: product.condition === "fairly used"
							? "Fairly used"
							: getCategory(product.category)?.name}
				</span>
			</div>
			<ProductImage product={product} className="aspect-square" />
			<div className="flex items-end justify-between gap-4 border-t border-line p-4">
				<h3 className="text-lg leading-tight font-medium">{product.name}</h3>
				<span className="label shrink-0 text-right">
					<Price product={product} />
				</span>
			</div>
		</Link>
	);
}
