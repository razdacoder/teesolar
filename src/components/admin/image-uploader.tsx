import {
	ArrowLeft,
	ArrowRight,
	ImagePlus,
	RotateCw,
	Star,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { imageUrl } from "#/lib/image-url";
import { discardUploads, signProductUpload } from "#/server/products";

export const MAX_IMAGES = 12;
// Cloudinary's free plan caps images at 10 MB.
const MAX_BYTES = 10 * 1024 * 1024;

type Upload = {
	id: string;
	file: File;
	preview: string;
	progress: number;
	error?: string;
};

type Signature = Awaited<ReturnType<typeof signProductUpload>>;

/** Posts straight to Cloudinary with XHR, since fetch can't report upload progress. */
function uploadToCloudinary(
	file: File,
	sig: Signature,
	onProgress: (fraction: number) => void,
) {
	return new Promise<string>((resolve, reject) => {
		const body = new FormData();
		body.append("file", file);
		body.append("api_key", sig.api_key);
		body.append("timestamp", String(sig.timestamp));
		body.append("signature", sig.signature);
		body.append("folder", sig.folder);
		body.append("allowed_formats", sig.allowed_formats);

		const xhr = new XMLHttpRequest();
		xhr.open("POST", sig.url);
		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) onProgress(e.loaded / e.total);
		};
		xhr.onload = () => {
			const res = JSON.parse(xhr.responseText || "{}");
			if (xhr.status >= 200 && xhr.status < 300 && res.secure_url) {
				resolve(res.secure_url);
			} else {
				reject(
					new Error(res.error?.message ?? `Upload failed (${xhr.status})`),
				);
			}
		};
		xhr.onerror = () =>
			reject(new Error("Network error. Check your connection."));
		xhr.send(body);
	});
}

export function ImageUploader({
	images,
	saved,
	onChange,
	onBusyChange,
	disabled,
}: {
	images: string[];
	/** Images already stored on the product; removing one of these waits for Save. */
	saved: string[];
	onChange: (update: (images: string[]) => string[]) => void;
	/** True while files are still uploading, so the form can hold off saving. */
	onBusyChange?: (busy: boolean) => void;
	disabled?: boolean;
}) {
	const [uploads, setUploads] = useState<Upload[]>([]);
	const [dragging, setDragging] = useState(false);
	const [notice, setNotice] = useState<string | null>(null);

	const busy = uploads.some((u) => !u.error);
	useEffect(() => onBusyChange?.(busy), [busy, onBusyChange]);

	const room =
		MAX_IMAGES - images.length - uploads.filter((u) => !u.error).length;
	const patch = (id: string, change: Partial<Upload>) =>
		setUploads((list) =>
			list.map((u) => (u.id === id ? { ...u, ...change } : u)),
		);
	const drop = (id: string) =>
		setUploads((list) => {
			const gone = list.find((u) => u.id === id);
			if (gone) URL.revokeObjectURL(gone.preview);
			return list.filter((u) => u.id !== id);
		});

	async function run(batch: Upload[]) {
		let sig: Signature;
		try {
			sig = await signProductUpload();
		} catch (error) {
			for (const u of batch) patch(u.id, { error: (error as Error).message });
			return;
		}
		await Promise.all(
			batch.map(async (u) => {
				try {
					const url = await uploadToCloudinary(u.file, sig, (progress) =>
						patch(u.id, { progress }),
					);
					onChange((list) => [...list, url]);
					drop(u.id);
				} catch (error) {
					patch(u.id, { error: (error as Error).message, progress: 0 });
				}
			}),
		);
	}

	function add(files: FileList | File[]) {
		setNotice(null);
		const all = Array.from(files);
		const images = all.filter((f) => f.type.startsWith("image/"));
		const fitting = images.filter((f) => f.size <= MAX_BYTES);
		const accepted = fitting.slice(0, Math.max(0, room));
		const skipped = [
			all.length > images.length && "only images can be uploaded",
			images.length > fitting.length && "photos must be under 10 MB",
			fitting.length > accepted.length &&
				`a product can have ${MAX_IMAGES} photos`,
		].filter(Boolean);
		if (skipped.length)
			setNotice(`Some files were skipped: ${skipped.join(", ")}.`);
		if (accepted.length === 0) return;

		const batch = accepted.map((file) => ({
			id: crypto.randomUUID(),
			file,
			preview: URL.createObjectURL(file),
			progress: 0,
		}));
		setUploads((list) => [...list, ...batch]);
		run(batch);
	}

	function remove(url: string) {
		onChange((list) => list.filter((u) => u !== url));
		// Never-saved uploads can go now; saved ones are cleaned up when the form is saved.
		if (!saved.includes(url))
			discardUploads({ data: { urls: [url] } }).catch(() => {});
	}

	function move(from: number, to: number) {
		onChange((list) => {
			const next = [...list];
			const [item] = next.splice(from, 1);
			next.splice(to, 0, item);
			return next;
		});
	}

	return (
		<div className="grid gap-3">
			{(images.length > 0 || uploads.length > 0) && (
				<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{images.map((src, i) => (
						<li
							key={src}
							className="group relative aspect-square overflow-hidden border border-line bg-card"
						>
							<img
								src={imageUrl(src, 400)}
								alt={i === 0 ? "Main" : `${i + 1} of ${images.length}`}
								className="size-full object-cover"
							/>
							{i === 0 && (
								<span className="label absolute top-2 left-2 bg-ink px-2 py-1 text-paper">
									Main
								</span>
							)}
							{!disabled && (
								<div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/75 p-1 text-paper opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
									<div className="flex">
										<TileButton
											label="Move left"
											disabled={i === 0}
											onClick={() => move(i, i - 1)}
										>
											<ArrowLeft className="size-4" />
										</TileButton>
										<TileButton
											label="Move right"
											disabled={i === images.length - 1}
											onClick={() => move(i, i + 1)}
										>
											<ArrowRight className="size-4" />
										</TileButton>
										{i > 0 && (
											<TileButton
												label="Make main photo"
												onClick={() => move(i, 0)}
											>
												<Star className="size-4" />
											</TileButton>
										)}
									</div>
									<TileButton label="Remove photo" onClick={() => remove(src)}>
										<Trash2 className="size-4" />
									</TileButton>
								</div>
							)}
						</li>
					))}
					{uploads.map((u) => (
						<li
							key={u.id}
							className="relative aspect-square overflow-hidden border border-line bg-card"
						>
							<img
								src={u.preview}
								alt=""
								className={`size-full object-cover ${u.error ? "opacity-30" : "opacity-60"}`}
							/>
							{u.error ? (
								<div className="absolute inset-0 grid content-end gap-2 p-2">
									<p className="bg-paper/90 p-2 text-xs text-red-700">
										{u.error}
									</p>
									<div className="flex justify-end gap-1">
										<TileButton
											label="Try again"
											dark
											onClick={() => {
												patch(u.id, { error: undefined, progress: 0 });
												run([{ ...u, error: undefined, progress: 0 }]);
											}}
										>
											<RotateCw className="size-4" />
										</TileButton>
										<TileButton label="Dismiss" dark onClick={() => drop(u.id)}>
											<X className="size-4" />
										</TileButton>
									</div>
								</div>
							) : (
								<div className="absolute inset-x-2 bottom-2">
									<div
										role="progressbar"
										aria-label={`Uploading ${u.file.name}`}
										aria-valuenow={Math.round(u.progress * 100)}
										className="h-1.5 bg-paper/80"
									>
										<div
											className="h-full bg-ink transition-[width]"
											style={{ width: `${Math.max(4, u.progress * 100)}%` }}
										/>
									</div>
								</div>
							)}
						</li>
					))}
				</ul>
			)}

			{!disabled && room > 0 && (
				<label
					onDragOver={(e) => {
						e.preventDefault();
						setDragging(true);
					}}
					onDragLeave={() => setDragging(false)}
					onDrop={(e) => {
						e.preventDefault();
						setDragging(false);
						add(e.dataTransfer.files);
					}}
					className={`flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-4 py-8 text-center text-sm transition-colors ${dragging ? "border-ink bg-sky/20" : "border-line bg-card hover:border-ink"}`}
				>
					<ImagePlus className="size-6 text-mute" aria-hidden="true" />
					<span>
						<span className="font-medium underline">Choose photos</span> or drag
						them here
					</span>
					<span className="text-xs text-mute">
						JPG, PNG, WebP or HEIC, up to 10 MB each · {room} more allowed
					</span>
					<input
						type="file"
						accept="image/*"
						multiple
						className="sr-only"
						onChange={(e) => {
							if (e.target.files) add(e.target.files);
							e.target.value = "";
						}}
					/>
				</label>
			)}
			{notice && <p className="text-xs text-mute">{notice}</p>}
			{images.length > 1 && !disabled && (
				<p className="text-xs text-mute">
					The first photo is the main one, used on cards and the home page.
				</p>
			)}
		</div>
	);
}

function TileButton({
	label,
	dark,
	children,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
	label: string;
	dark?: boolean;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			{...props}
			className={`grid size-8 place-items-center disabled:opacity-30 ${dark ? "bg-ink text-paper hover:bg-ink/85" : "hover:bg-paper/20"}`}
		>
			{children}
		</button>
	);
}
