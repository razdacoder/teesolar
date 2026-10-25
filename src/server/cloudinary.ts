// Server-only Cloudinary helpers. Uses the REST API directly; signing is all the SDK
// would add. https://cloudinary.com/documentation/authentication_signatures
import { createHash } from "node:crypto";

export const UPLOAD_FOLDER = "teesolar/products";

export function cloudinaryConfig() {
	const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
	const apiKey = process.env.CLOUDINARY_API_KEY;
	const apiSecret = process.env.CLOUDINARY_API_SECRET;
	if (!cloudName || !apiKey || !apiSecret) return null;
	return { cloudName, apiKey, apiSecret };
}

/** Cloudinary's signature: params sorted by key, joined as a query string, plus the secret. */
export function sign(
	params: Record<string, string | number>,
	apiSecret: string,
) {
	const toSign = Object.keys(params)
		.sort()
		.map((key) => `${key}=${params[key]}`)
		.join("&");
	return createHash("sha1")
		.update(toSign + apiSecret)
		.digest("hex");
}

/**
 * The public id of an image we uploaded, or null for anything else, so we never try to
 * delete images that live outside our folder (or outside Cloudinary).
 */
export function publicIdOf(url: string, cloudName: string) {
	const prefix = `https://res.cloudinary.com/${cloudName}/image/upload/`;
	if (!url.startsWith(prefix)) return null;
	// Strip transformations and the version (v123…), then the extension.
	const path = url
		.slice(prefix.length)
		.split("/")
		.filter((part) => !part.includes(",") && !/^v\d+$/.test(part))
		.join("/")
		.replace(/\.[a-z0-9]+$/i, "");
	return path.startsWith(`${UPLOAD_FOLDER}/`) ? path : null;
}

/**
 * Deletes images from Cloudinary. Best effort: a failure here shouldn't undo the product
 * change that triggered it, so errors are logged rather than thrown.
 */
export async function destroyImages(urls: string[]) {
	const config = cloudinaryConfig();
	if (!config || urls.length === 0) return;
	const ids = urls
		.map((url) => publicIdOf(url, config.cloudName))
		.filter((id): id is string => id !== null);

	await Promise.all(
		ids.map(async (public_id) => {
			const timestamp = Math.round(Date.now() / 1000);
			const body = new URLSearchParams({
				public_id,
				timestamp: String(timestamp),
				api_key: config.apiKey,
				signature: sign({ public_id, timestamp }, config.apiSecret),
			});
			try {
				const res = await fetch(
					`https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
					{ method: "POST", body },
				);
				if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
			} catch (error) {
				console.error(`Couldn't delete ${public_id} from Cloudinary:`, error);
			}
		}),
	);
}
