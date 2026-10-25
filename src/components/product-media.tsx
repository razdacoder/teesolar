import { useState } from "react";
import type { Product } from "#/data/products";
import { imageUrl } from "#/lib/image-url";
import { CategoryIcon } from "./icons";

/** The shop's photo when we have one, otherwise a quiet icon tile. */
export function ProductImage({
	product,
	src = product.images[0],
	width = 800,
	eager = false,
	className = "",
	iconClassName = "size-1/3",
}: {
	product: Product;
	/** Defaults to the main photo. */
	src?: string;
	/** Rendered width in CSS pixels; Cloudinary serves twice this for sharp screens. */
	width?: number;
	eager?: boolean;
	className?: string;
	iconClassName?: string;
}) {
	if (!src) {
		return (
			<div className={`grid place-items-center bg-card ${className}`}>
				<CategoryIcon
					id={product.category}
					className={`text-ink/80 transition-transform duration-500 group-hover:scale-110 ${iconClassName}`}
				/>
			</div>
		);
	}
	return (
		<div className={`overflow-hidden bg-card ${className}`}>
			<img
				src={imageUrl(src, width * 2)}
				alt={product.name}
				loading={eager ? "eager" : "lazy"}
				className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
			/>
		</div>
	);
}

/** Main photo with thumbnails underneath when there's more than one. */
export function ProductGallery({
	product,
	className = "",
}: {
	product: Product;
	className?: string;
}) {
	const [active, setActive] = useState(0);
	const { images } = product;
	const current = images[active] ?? images[0];

	return (
		<div className={`relative ${className}`}>
			<ProductImage
				product={product}
				src={current}
				width={1000}
				eager
				className="aspect-square size-full md:aspect-auto"
				iconClassName="size-1/4"
			/>
			{images.length === 0 && (
				<span className="label absolute bottom-4 left-4 text-mute md:left-8">
					Photo coming soon
				</span>
			)}
			{images.length > 1 && (
				<div className="no-scrollbar absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto p-4 md:px-8">
					{images.map((src, i) => (
						<button
							key={src}
							type="button"
							onClick={() => setActive(i)}
							aria-label={`Show photo ${i + 1} of ${images.length}`}
							aria-pressed={i === active}
							className={`size-16 shrink-0 overflow-hidden border-2 bg-card ${i === active ? "border-sun" : "border-paper/80"}`}
						>
							<img
								src={imageUrl(src, 128)}
								alt=""
								className="size-full object-cover"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
