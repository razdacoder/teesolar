import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ContactLine,
	LegalPage,
	type LegalSection,
} from "#/components/legal-page";
import { legal, site } from "#/data/site";

export const Route = createFileRoute("/terms")({
	head: () => ({ meta: [{ title: "Terms of sale | Tee Solar Inverters" }] }),
	component: Terms,
});

const sections: LegalSection[] = [
	{
		id: "about-these-terms",
		title: "About these terms",
		body: (
			<>
				<p>
					These terms cover your use of this website and anything you buy from{" "}
					{site.name}, a trading name of {legal.company} ({legal.rcNumber}),{" "}
					{site.address}.
				</p>
				<p>
					By using the site or buying from us, you agree to these terms. Nothing
					here takes away your rights under the Federal Competition and Consumer
					Protection Act 2018 or any other Nigerian law that protects you as a
					customer.
				</p>
			</>
		),
	},
	{
		id: "the-website",
		title: "Using this website",
		body: (
			<>
				<p>
					We try hard to keep everything on this site accurate, but product
					details, photos and specifications are a guide. Manufacturers
					sometimes change their products, and what you see on screen may differ
					slightly from the real thing.
				</p>
				<p>
					The load calculator gives a rough estimate based on typical
					appliances. It isn't a professional assessment. Before we quote, we'll
					check what you actually need.
				</p>
			</>
		),
	},
	{
		id: "prices",
		title: "Prices and quotes",
		body: (
			<>
				<p>
					Prices on this website are a guide. They change often, mostly with the
					exchange rate. The price you pay is the one we confirm to you in
					writing, on WhatsApp or on your invoice.
				</p>
				<p>
					A written quote is valid for {legal.quoteValidDays} days unless it
					says otherwise. After that, we'll happily re-check the price for you.
				</p>
			</>
		),
	},
	{
		id: "payment",
		title: "Orders and payment",
		body: (
			<>
				<p>
					Your order is confirmed once we've confirmed the item is available and
					received your payment, or the deposit we agreed with you.
				</p>
				<p>
					<strong>Protect yourself from fraud.</strong> Only pay into an account
					in the name of {legal.company}, or one we confirm to you from our
					official number, {site.phoneDisplay}. We will never ask you to pay
					into a personal account from a different number. If anything looks
					off, call us before you pay.
				</p>
			</>
		),
	},
	{
		id: "delivery",
		title: "Delivery and installation",
		body: (
			<>
				<p>
					We'll agree a delivery and installation date with you. Dates are our
					best estimate, and we'll let you know quickly if anything changes.
				</p>
				<p>
					Please make sure our team can safely reach where the equipment is
					going, including the roof for panels. If we find that extra work or
					materials are needed, we'll explain why and agree the cost with you
					before we do it.
				</p>
				<p>
					Once everything is installed, we'll show you how to use and look after
					your system.
				</p>
			</>
		),
	},
	{
		id: "warranty",
		title: "Warranty",
		body: (
			<>
				<p>
					New products come with a one-year warranty from the date of purchase,
					or from installation if we installed them. It covers faults in
					materials and workmanship. Some manufacturers offer longer warranties,
					and we'll help you claim those too.
				</p>
				<p>
					Fairly used products are covered only by the warranty we state in
					writing when you buy.
				</p>
				<p>The warranty doesn't cover damage caused by:</p>
				<ul>
					<li>running more load than the product is rated for</li>
					<li>misuse, accidents, water, fire or lightning</li>
					<li>
						repairs or changes made by anyone other than us or the manufacturer
					</li>
				</ul>
				<p>
					It also doesn't cover the gradual loss of capacity that all batteries
					go through with age. Keep your receipt, as we'll need it for any
					claim.
				</p>
			</>
		),
	},
	{
		id: "faults",
		title: "If something goes wrong",
		body: (
			<>
				<p>
					If a product arrives damaged or doesn't work when it's installed, tell
					us within {legal.faultReportDays} days and don't try to repair it
					yourself. We'll inspect it and, depending on the fault, repair it,
					replace it or give you a refund.
				</p>
				<p>
					For faults later on, contact us under the warranty. If you simply
					change your mind about a product that works properly, we're not
					obliged to take it back, but talk to us, as we'll always try to help.
				</p>
			</>
		),
	},
	{
		id: "liability",
		title: "Our responsibility to you",
		body: (
			<>
				<p>
					We're responsible for loss or damage that's a foreseeable result of us
					breaking these terms or being careless. We're not responsible for
					indirect losses, such as lost business or profits, or for problems
					caused by things outside our control.
				</p>
				<p>
					Nothing in these terms limits our responsibility in ways the law
					doesn't allow, including for death or injury caused by our negligence.
				</p>
			</>
		),
	},
	{
		id: "other-sites",
		title: "Links to other sites",
		body: (
			<p>
				This site links to and shows content from other services, like TikTok,
				WhatsApp and Google Maps. We don't control them and aren't responsible
				for their content or how they handle your information. See our{" "}
				<Link to="/privacy">privacy policy</Link> for more.
			</p>
		),
	},
	{
		id: "content",
		title: "Our content",
		body: (
			<p>
				The text, design and logo on this website belong to {legal.company}.
				Please don't copy them without our permission. Product brand names
				belong to their owners.
			</p>
		),
	},
	{
		id: "law",
		title: "Disagreements and the law",
		body: (
			<p>
				If something isn't right, please talk to us first, as most problems can
				be sorted out quickly. These terms are governed by the laws of the
				Federal Republic of Nigeria, and any dispute that can't be resolved
				between us will be handled by the courts of Lagos State.
			</p>
		),
	},
	{
		id: "changes",
		title: "Changes to these terms",
		body: (
			<p>
				We may update these terms from time to time. The version that applies to
				your order is the one on this page when you placed it.
			</p>
		),
	},
	{
		id: "contact",
		title: "Questions",
		body: (
			<p>
				<ContactLine message="Hi Tee Solar, I have a question about your terms of sale." />
				.
			</p>
		),
	},
];

function Terms() {
	return (
		<LegalPage
			eyebrow="Terms of sale & use"
			title="Terms of sale"
			intro={
				<p>
					The deal between us, in plain English: what you can expect from us
					when you buy, and what we ask of you in return.
				</p>
			}
			sections={sections}
		/>
	);
}
