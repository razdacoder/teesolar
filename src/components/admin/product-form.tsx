import { useState } from "react";
import { z } from "zod";
import { categories } from "#/data/products";
import { type Product, productInsertSchema } from "#/db/schema";
import { ImageUploader } from "./image-uploader";
import { Button, ErrorText, Field, Input, Select, Textarea } from "./ui";

export const productFormSchema = productInsertSchema.extend({
	openingStock: z.int("Whole numbers only").nonnegative().optional(),
});
export type ProductFormValues = z.output<typeof productFormSchema>;

const toText = (v: number | string | null | undefined) =>
	v === null || v === undefined ? "" : String(v);

function initialValues(product?: Product) {
	return {
		name: product?.name ?? "",
		slug: product?.slug ?? "",
		brand: product?.brand ?? "",
		category: product?.category ?? "solar-generators",
		summary: product?.summary ?? "",
		highlights: product?.highlights.join("\n") ?? "",
		price: toText(product?.price),
		oldPrice: toText(product?.oldPrice),
		condition: product?.condition ?? "new",
		output: toText(product?.output),
		storage: toText(product?.storage),
		images: product?.images ?? [],
		video: product?.video ?? "",
		featured: product?.featured ?? false,
		published: product?.published ?? true,
		openingStock: "0",
	};
}
type FormState = ReturnType<typeof initialValues>;

const slugify = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

/** Blank inputs mean "not set", not zero. */
const optionalNumber = (v: string) => (v.trim() === "" ? null : Number(v));
const optionalText = (v: string) => v.trim() || null;

export function ProductForm({
	product,
	readOnly,
	pending,
	error,
	submitLabel,
	onSubmit,
}: {
	product?: Product;
	readOnly?: boolean;
	pending: boolean;
	error: Error | null;
	submitLabel: string;
	onSubmit: (values: ProductFormValues) => void;
}) {
	const [form, setForm] = useState(() => initialValues(product));
	// New products follow the name until someone edits the slug by hand.
	const [slugTouched, setSlugTouched] = useState(Boolean(product));
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [uploading, setUploading] = useState(false);

	const set =
		(key: Exclude<keyof FormState, "images">) =>
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			>,
		) => {
			const value =
				e.target instanceof HTMLInputElement && e.target.type === "checkbox"
					? e.target.checked
					: e.target.value;
			setForm((f) => ({
				...f,
				[key]: value,
				...(key === "name" && !slugTouched
					? { slug: slugify(String(value)) }
					: {}),
			}));
		};

	function submit(e: React.FormEvent) {
		e.preventDefault();
		const parsed = productFormSchema.safeParse({
			name: form.name,
			slug: form.slug,
			brand: optionalText(form.brand),
			category: form.category,
			summary: form.summary,
			highlights: form.highlights
				.split("\n")
				.map((h) => h.trim())
				.filter(Boolean),
			price: optionalNumber(form.price),
			oldPrice: optionalNumber(form.oldPrice),
			condition: form.condition,
			output: optionalNumber(form.output),
			storage: optionalNumber(form.storage),
			images: form.images,
			video: optionalText(form.video),
			featured: form.featured,
			published: form.published,
			openingStock: product ? undefined : Number(form.openingStock || 0),
		});
		if (!parsed.success) {
			setErrors(
				Object.fromEntries(
					parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
				),
			);
			return;
		}
		setErrors({});
		onSubmit(parsed.data);
	}

	return (
		<form onSubmit={submit}>
			<fieldset disabled={readOnly} className="grid gap-8">
				<Section title="Basics">
					<Field label="Name" error={errors.name}>
						<Input value={form.name} onChange={set("name")} />
					</Field>
					<Field
						label="Slug"
						hint={`Web address: /products/${form.slug || "…"}`}
						error={errors.slug}
					>
						<Input
							value={form.slug}
							onChange={(e) => {
								setSlugTouched(true);
								set("slug")(e);
							}}
						/>
					</Field>
					<Field label="Category" error={errors.category}>
						<Select value={form.category} onChange={set("category")}>
							{categories.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</Select>
					</Field>
					<Field label="Brand" error={errors.brand}>
						<Input value={form.brand} onChange={set("brand")} />
					</Field>
					<Field
						label="Summary"
						error={errors.summary}
						className="sm:col-span-2"
					>
						<Textarea rows={3} value={form.summary} onChange={set("summary")} />
					</Field>
					<Field
						label="Highlights"
						hint="One per line. Shown as bullet points."
						error={errors.highlights}
						className="sm:col-span-2"
					>
						<Textarea
							rows={3}
							value={form.highlights}
							onChange={set("highlights")}
						/>
					</Field>
				</Section>

				<Section title="Price">
					<Field
						label="Price (₦)"
						hint="Leave blank to show “Ask for price”."
						error={errors.price}
					>
						<Input
							type="number"
							min={0}
							value={form.price}
							onChange={set("price")}
						/>
					</Field>
					<Field
						label="Old price (₦)"
						hint="Shown crossed out next to the price."
						error={errors.oldPrice}
					>
						<Input
							type="number"
							min={0}
							value={form.oldPrice}
							onChange={set("oldPrice")}
						/>
					</Field>
					<Field label="Condition" error={errors.condition}>
						<Select value={form.condition} onChange={set("condition")}>
							<option value="new">New</option>
							<option value="fairly used">Fairly used</option>
						</Select>
					</Field>
					{!product && (
						<Field
							label="Opening stock"
							hint="Units in the shop right now."
							error={errors.openingStock}
						>
							<Input
								type="number"
								min={0}
								value={form.openingStock}
								onChange={set("openingStock")}
							/>
						</Field>
					)}
				</Section>

				<Section
					title="Specs"
					description="Used by the load calculator to suggest this product."
				>
					<Field label="Output (watts)" error={errors.output}>
						<Input
							type="number"
							min={1}
							value={form.output}
							onChange={set("output")}
						/>
					</Field>
					<Field label="Battery storage (kWh)" error={errors.storage}>
						<Input
							type="number"
							step="0.01"
							min={0}
							value={form.storage}
							onChange={set("storage")}
						/>
					</Field>
				</Section>

				<Section
					title="Photos"
					description="Square photos on a plain background look best. Drag to add several at once."
				>
					{/* Not a <Field>: the uploader has its own <label>, and labels can't nest. */}
					<div className="grid gap-1.5 sm:col-span-2">
						<ImageUploader
							images={form.images}
							saved={product?.images ?? []}
							onChange={(update) =>
								setForm((f) => ({ ...f, images: update(f.images) }))
							}
							onBusyChange={setUploading}
							disabled={readOnly}
						/>
						{errors.images && (
							<span className="text-xs text-red-700">{errors.images}</span>
						)}
					</div>
					<Field
						label="TikTok video id"
						hint="The number at the end of the video's URL."
						error={errors.video}
					>
						<Input value={form.video} onChange={set("video")} />
					</Field>
				</Section>

				<Section title="Visibility">
					<Toggle
						checked={form.published}
						onChange={set("published")}
						label="Show in the shop"
						hint="Hidden products keep their stock history."
					/>
					<Toggle
						checked={form.featured}
						onChange={set("featured")}
						label="Feature on the home page"
						hint="Appears in the big slideshow at the top."
					/>
				</Section>

				{!readOnly && (
					<div className="flex items-center gap-4 border-t border-line pt-6">
						<Button type="submit" disabled={pending || uploading}>
							{pending
								? "Saving…"
								: uploading
									? "Waiting for photos…"
									: submitLabel}
						</Button>
						<ErrorText error={error} />
					</div>
				)}
			</fieldset>
		</form>
	);
}

function Section({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="grid gap-6 md:grid-cols-[12rem_1fr]">
			<div>
				<h2 className="font-semibold">{title}</h2>
				{description && <p className="mt-1 text-sm text-mute">{description}</p>}
			</div>
			<div className="grid gap-4 sm:grid-cols-2">{children}</div>
		</div>
	);
}

function Toggle({
	checked,
	onChange,
	label,
	hint,
}: {
	checked: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	label: string;
	hint: string;
}) {
	return (
		<label className="flex items-start gap-3 border border-line bg-card p-3">
			<input
				type="checkbox"
				checked={checked}
				onChange={onChange}
				className="mt-1 accent-ink"
			/>
			<span>
				<span className="block text-sm font-medium">{label}</span>
				<span className="block text-xs text-mute">{hint}</span>
			</span>
		</label>
	);
}
