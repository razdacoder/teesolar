// Business details gathered from public TikTok captions — see docs/research.md.
// Confirm with the owner before launch.
export const site = {
	name: "Tee Solar Inverters & Power Company",
	shortName: "Tee Solar",
	// The logo spells it "Realiable"; corrected here.
	motto: "Reliable & Rest Assured",
	parent: "DarlingTee Global Limited",
	tagline: "Steady light for Lagos homes and businesses",
	slogan: "Sweet sweet deals",
	phoneDisplay: "0813 852 6238",
	phoneTel: "+2348138526238",
	whatsapp: "2348138526238",
	address: "DarlingTee Mall, Ijegun, Lagos, Nigeria",
	mapQuery: "Ijegun, Lagos, Nigeria",
	warranty: "1-year warranty on new products",
	social: {
		tiktok: "https://www.tiktok.com/@teesolarinverter",
		phones: "https://www.tiktok.com/@darlingteephones",
		website: "https://darlingtee.com.ng/",
	},
} as const;

// Used by the About, Privacy and Terms pages. The company details come from the public
// CAC listing; the numbers below are sensible defaults — the owner should confirm them,
// and a Nigerian lawyer should review the policies before launch.
export const legal = {
	company: "DarlingTee Global Limited",
	rcNumber: "RC 7795698",
	updated: "25 October 2026",
	/** How long a written quote holds, unless the quote says otherwise. */
	quoteValidDays: 7,
	/** Window for reporting a fault found on delivery or installation. */
	faultReportDays: 7,
	/** How long we keep enquiries that never became a sale. */
	enquiryRetentionMonths: 12,
	/** Add a business email when there is one; the policies fall back to phone/WhatsApp. */
	email: null as string | null,
};

export function whatsappLink(message: string) {
	return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

const naira = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	maximumFractionDigits: 0,
});

export function formatNaira(amount: number) {
	return naira.format(amount);
}
