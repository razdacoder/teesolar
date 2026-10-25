const CLOUDINARY_UPLOAD =
	/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

/**
 * Sizes a product image for where it's shown. Cloudinary images get resized and served
 * as WebP/AVIF with automatic quality; anything else (e.g. /public paths) passes through.
 */
export function imageUrl(src: string, width: number) {
	const match = CLOUDINARY_UPLOAD.exec(src);
	if (!match) return src;
	return `${match[1]}f_auto,q_auto,c_limit,w_${width}/${match[2]}`;
}
