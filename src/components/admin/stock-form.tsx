import { useState } from "react";
import { stockReasonEnum } from "#/db/schema";
import { useAdjustStock } from "#/queries/products";
import { Button, ErrorText, Field, Input, Select } from "./ui";

type Reason = (typeof stockReasonEnum.enumValues)[number];

export const reasonInfo: Record<Reason, { label: string; hint: string }> = {
	restock: { label: "Restock", hint: "New units arrived. Adds to stock." },
	sale: { label: "Sale", hint: "Units sold. Takes them out of stock." },
	return: {
		label: "Return",
		hint: "A customer brought units back. Adds to stock.",
	},
	adjustment: {
		label: "Adjustment",
		hint: "Fix a miscount. Use a minus sign to remove units.",
	},
};

/** Turns what people type into a signed quantity: sales remove, restocks and returns add. */
function signed(reason: Reason, n: number) {
	if (reason === "sale") return -Math.abs(n);
	if (reason === "adjustment") return n;
	return Math.abs(n);
}

export function StockForm({
	productId,
	stock,
	onDone,
}: {
	productId: string;
	stock: number;
	onDone?: () => void;
}) {
	const adjust = useAdjustStock();
	const [reason, setReason] = useState<Reason>("restock");
	const [quantity, setQuantity] = useState("");
	const [note, setNote] = useState("");

	const n = Number.parseInt(quantity, 10) || 0;
	const after = stock + signed(reason, n);

	function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!n) return;
		adjust.mutate(
			{
				data: {
					productId,
					quantity: signed(reason, n),
					reason,
					note: note.trim() || null,
				},
			},
			{
				onSuccess: () => {
					setQuantity("");
					setNote("");
					onDone?.();
				},
			},
		);
	}

	return (
		<form onSubmit={submit} className="grid gap-4">
			<div className="grid grid-cols-2 gap-3">
				<Field
					label="Reason"
					hint={reasonInfo[reason].hint}
					className="col-span-2"
				>
					<Select
						value={reason}
						onChange={(e) => setReason(e.target.value as Reason)}
					>
						{stockReasonEnum.enumValues.map((r) => (
							<option key={r} value={r}>
								{reasonInfo[r].label}
							</option>
						))}
					</Select>
				</Field>
				<Field label="Quantity">
					<Input
						type="number"
						inputMode="numeric"
						min={reason === "adjustment" ? undefined : 1}
						required
						value={quantity}
						onChange={(e) => setQuantity(e.target.value)}
						autoFocus
					/>
				</Field>
				<Field label="Stock after">
					<p
						className={`flex h-10 items-center font-mono ${after < 0 ? "text-red-700" : ""}`}
					>
						{stock} → {after}
					</p>
				</Field>
				<Field label="Note (optional)" className="col-span-2">
					<Input
						value={note}
						onChange={(e) => setNote(e.target.value)}
						placeholder="e.g. Sold to Mr Ade, paid by transfer"
					/>
				</Field>
			</div>
			<ErrorText error={adjust.error} />
			<Button type="submit" disabled={adjust.isPending || !n || after < 0}>
				{adjust.isPending ? "Saving…" : "Record"}
			</Button>
		</form>
	);
}
