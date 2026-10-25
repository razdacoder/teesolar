// Building blocks for the admin panel. Same tokens as the shop, denser layout.
import { X } from "lucide-react";
import {
	type ButtonHTMLAttributes,
	type InputHTMLAttributes,
	type ReactNode,
	type SelectHTMLAttributes,
	type TextareaHTMLAttributes,
	useEffect,
	useRef,
	useState,
} from "react";

const buttonVariants = {
	primary: "bg-ink text-paper hover:bg-ink/85",
	outline: "border border-line bg-card text-ink hover:border-ink",
	danger: "bg-red-700 text-white hover:bg-red-800",
	ghost: "text-mute hover:bg-line/50 hover:text-ink",
};

export function Button({
	variant = "primary",
	size = "md",
	className = "",
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: keyof typeof buttonVariants;
	size?: "sm" | "md";
}) {
	return (
		<button
			type="button"
			{...props}
			className={`label inline-flex shrink-0 items-center justify-center gap-2 transition-colors disabled:pointer-events-none disabled:opacity-50 ${size === "sm" ? "h-8 px-3" : "h-10 px-4"} ${buttonVariants[variant]} ${className}`}
		/>
	);
}

const control =
	"w-full border border-line bg-card px-3 text-sm outline-none focus:border-ink disabled:bg-paper disabled:text-mute";

export function Input({
	className = "",
	...props
}: InputHTMLAttributes<HTMLInputElement>) {
	return <input {...props} className={`h-10 ${control} ${className}`} />;
}

export function Select({
	className = "",
	...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
	return <select {...props} className={`h-10 ${control} ${className}`} />;
}

export function Textarea({
	className = "",
	...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return <textarea {...props} className={`py-2 ${control} ${className}`} />;
}

export function Field({
	label,
	hint,
	error,
	className = "",
	children,
}: {
	label: string;
	hint?: string;
	error?: string;
	className?: string;
	children: ReactNode;
}) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: the control is passed as children
		<label className={`grid content-start gap-1.5 ${className}`}>
			<span className="label text-mute">{label}</span>
			{children}
			{error ? (
				<span className="text-xs text-red-700">{error}</span>
			) : (
				hint && <span className="text-xs text-mute">{hint}</span>
			)}
		</label>
	);
}

const badgeTones = {
	neutral: "bg-line/60 text-mute",
	ink: "bg-ink text-paper",
	sun: "bg-sun/30 text-ink",
	green: "bg-emerald-100 text-emerald-800",
	red: "bg-red-100 text-red-800",
};

export function Badge({
	tone = "neutral",
	children,
}: {
	tone?: keyof typeof badgeTones;
	children: ReactNode;
}) {
	return (
		<span
			className={`label inline-flex h-6 items-center px-2 whitespace-nowrap ${badgeTones[tone]}`}
		>
			{children}
		</span>
	);
}

export function PageHeader({
	title,
	description,
	actions,
}: {
	title: string;
	description?: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
			<div>
				<h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
				{description && <p className="mt-1 text-sm text-mute">{description}</p>}
			</div>
			{actions && <div className="flex flex-wrap gap-2">{actions}</div>}
		</header>
	);
}

export function Card({
	title,
	actions,
	className = "",
	children,
}: {
	title?: string;
	actions?: ReactNode;
	className?: string;
	children: ReactNode;
}) {
	return (
		<section className={`border border-line bg-card ${className}`}>
			{title && (
				<div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
					<h2 className="label text-mute">{title}</h2>
					{actions}
				</div>
			)}
			{children}
		</section>
	);
}

export function ErrorText({ error }: { error: Error | null | undefined }) {
	if (!error) return null;
	return (
		<p role="alert" className="text-sm text-red-700">
			{error.message}
		</p>
	);
}

export function Empty({ children }: { children: ReactNode }) {
	return <p className="px-5 py-10 text-center text-sm text-mute">{children}</p>;
}

/** Native <dialog>, so focus trapping and Escape come for free. */
export function Dialog({
	open,
	onClose,
	title,
	children,
}: {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
}) {
	const ref = useRef<HTMLDialogElement>(null);
	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	return (
		<dialog
			ref={ref}
			onClose={onClose}
			className="m-auto w-[min(32rem,calc(100vw-2rem))] border border-line bg-paper p-0 text-ink backdrop:bg-ink/40"
		>
			<div className="flex items-center justify-between border-b border-line px-5 py-3">
				<h2 className="font-semibold">{title}</h2>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close"
					className="text-mute hover:text-ink"
				>
					<X className="size-4" />
				</button>
			</div>
			<div className="p-5">{open && children}</div>
		</dialog>
	);
}

/** A button that asks before doing something destructive. */
export function ConfirmButton({
	title,
	message,
	confirmLabel,
	onConfirm,
	pending,
	error,
	children,
	...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> & {
	title: string;
	message: ReactNode;
	confirmLabel: string;
	onConfirm: () => Promise<unknown>;
	pending?: boolean;
	error?: Error | null;
	variant?: keyof typeof buttonVariants;
	size?: "sm" | "md";
}) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button {...buttonProps} onClick={() => setOpen(true)}>
				{children}
			</Button>
			<Dialog open={open} onClose={() => setOpen(false)} title={title}>
				<div className="grid gap-5 text-sm">
					<div>{message}</div>
					<ErrorText error={error} />
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="danger"
							disabled={pending}
							onClick={() =>
								onConfirm().then(
									() => setOpen(false),
									() => {},
								)
							}
						>
							{confirmLabel}
						</Button>
					</div>
				</div>
			</Dialog>
		</>
	);
}

/** A signed stock change: green when it adds units, red when it removes them. */
export function Quantity({ value }: { value: number }) {
	return (
		<span
			className={`font-mono text-sm ${value > 0 ? "text-emerald-700" : "text-red-700"}`}
		>
			{value > 0 ? `+${value}` : value}
		</span>
	);
}

export const dateTime = new Intl.DateTimeFormat("en-NG", {
	dateStyle: "medium",
	timeStyle: "short",
});

export const date = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" });
