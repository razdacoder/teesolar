import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ContactLine,
	LegalPage,
	type LegalSection,
} from "#/components/legal-page";
import { legal, site } from "#/data/site";

export const Route = createFileRoute("/privacy")({
	head: () => ({ meta: [{ title: "Privacy policy | Tee Solar Inverters" }] }),
	component: Privacy,
});

// Written against the Nigeria Data Protection Act 2023 and what this site actually does:
// no cookies or analytics of our own; TikTok, Google Maps, Google Fonts and WhatsApp are third parties.
const sections: LegalSection[] = [
	{
		id: "who-we-are",
		title: "Who we are",
		body: (
			<>
				<p>
					This website belongs to {site.name}, a trading name of {legal.company}{" "}
					({legal.rcNumber}), based at {site.address}. In this policy, "we",
					"us" and "our" mean {legal.company}.
				</p>
				<p>
					We decide how your personal information is used, which makes us the
					data controller under the Nigeria Data Protection Act 2023.
				</p>
			</>
		),
	},
	{
		id: "what-we-collect",
		title: "What we collect",
		body: (
			<>
				<p>
					<strong>Things you tell us.</strong> When you message us on WhatsApp,
					call, visit the shop or buy from us, we may collect:
				</p>
				<ul>
					<li>
						your name and phone number (and your WhatsApp profile name and
						picture)
					</li>
					<li>your delivery or installation address</li>
					<li>
						what you want to power, and any appliance list you choose to send us
					</li>
					<li>
						details of what you bought, your payments and any warranty claims
					</li>
				</ul>
				<p>
					We don't take card details on this website. If you pay by bank
					transfer, we'll see the name and bank on the transfer, like any
					business would.
				</p>
				<p>
					<strong>The load calculator.</strong> The calculator works entirely in
					your browser. We don't see your appliance list unless you tap the
					button to send it to us on WhatsApp.
				</p>
				<p>
					<strong>Browsing this website.</strong> We don't use cookies,
					analytics or advertising trackers. Like most websites, our hosting
					provider may keep basic technical logs (such as your IP address,
					browser type and the pages requested) to keep the site running and
					secure.
				</p>
			</>
		),
	},
	{
		id: "third-parties",
		title: "Other companies on our pages",
		body: (
			<>
				<p>
					Some parts of this site load content from other companies. When that
					happens, they can see your IP address and may set their own cookies,
					under their own privacy policies:
				</p>
				<ul>
					<li>
						<strong>TikTok</strong>, for the product videos. The player only
						loads when you scroll to a video.
					</li>
					<li>
						<strong>Google Maps</strong>, for the map on our contact page.
					</li>
					<li>
						<strong>Google Fonts</strong>, which supplies the typefaces this
						site uses.
					</li>
					<li>
						<strong>WhatsApp (Meta)</strong>, when you message us. Your chat is
						handled by WhatsApp as well as by us.
					</li>
				</ul>
			</>
		),
	},
	{
		id: "how-we-use-it",
		title: "How we use it, and why we're allowed to",
		body: (
			<>
				<p>We only use your information where the law gives us a reason to:</p>
				<ul>
					<li>
						<strong>To answer you and prepare a quote</strong>, because you
						asked us to (steps before a contract).
					</li>
					<li>
						<strong>To deliver, install and support what you buy</strong>,
						including warranty repairs (to perform our contract with you).
					</li>
					<li>
						<strong>To keep sales and tax records</strong>, because the law
						requires it.
					</li>
					<li>
						<strong>To prevent fraud and improve our service</strong>, which is
						in our legitimate interest, as long as it doesn't override your
						rights.
					</li>
					<li>
						<strong>To send you deals and updates</strong>, but only if you've
						said yes. You can say stop at any time, and we'll stop.
					</li>
				</ul>
			</>
		),
	},
	{
		id: "sharing",
		title: "Who we share it with",
		body: (
			<>
				<p>
					We never sell your personal information. We only share it when we need
					to:
				</p>
				<ul>
					<li>
						with our installers and delivery team, so they can find you and do
						the job
					</li>
					<li>
						with manufacturers or distributors, when we make a warranty claim
						for you
					</li>
					<li>with our accountants, lawyers or other professional advisers</li>
					<li>
						with the police, courts or regulators, when the law requires it
					</li>
				</ul>
				<p>
					Some of the services we use, like WhatsApp and Google, may store data
					outside Nigeria. Where that happens, we rely on the safeguards allowed
					under the Nigeria Data Protection Act.
				</p>
			</>
		),
	},
	{
		id: "how-long",
		title: "How long we keep it",
		body: (
			<>
				<p>
					We keep records of what you bought for as long as you might need
					warranty support, and for as long as the law requires us to keep tax
					and accounting records.
				</p>
				<p>
					If you asked about something but didn't buy, we delete or anonymise
					your details within {legal.enquiryRetentionMonths} months of our last
					conversation.
				</p>
			</>
		),
	},
	{
		id: "your-rights",
		title: "Your rights",
		body: (
			<>
				<p>
					Under the Nigeria Data Protection Act 2023, you have the right to:
				</p>
				<ul>
					<li>ask for a copy of the information we hold about you</li>
					<li>have it corrected if it's wrong</li>
					<li>ask us to delete it, or to stop or limit how we use it</li>
					<li>
						withdraw consent you've given us, such as for marketing messages
					</li>
					<li>get your information in a format you can take elsewhere</li>
				</ul>
				<p>
					To use any of these rights,{" "}
					<ContactLine message="Hi Tee Solar, I'd like to make a request about my personal data." />
					. We may ask you to confirm who you are first. We'll reply as soon as
					we can, and within the time the law allows.
				</p>
				<p>
					If you're not happy with how we've handled your information, you can
					complain to the Nigeria Data Protection Commission at{" "}
					<a href="https://ndpc.gov.ng" target="_blank" rel="noreferrer">
						ndpc.gov.ng
					</a>
					. We'd appreciate the chance to fix it first, though.
				</p>
			</>
		),
	},
	{
		id: "security",
		title: "Keeping it safe",
		body: (
			<p>
				Only the staff who need your details to serve you can see them, and we
				keep our phones and records protected. No system is perfectly secure,
				but if something ever goes wrong in a way that affects you, we'll tell
				you and the regulator as the law requires.
			</p>
		),
	},
	{
		id: "children",
		title: "Children",
		body: (
			<p>
				Our products and this website are meant for adults. We don't knowingly
				collect information from anyone under 18.
			</p>
		),
	},
	{
		id: "changes",
		title: "Changes to this policy",
		body: (
			<p>
				If we change how we use your information, we'll update this page and the
				date at the top. For bigger changes, we'll let customers know directly.
			</p>
		),
	},
	{
		id: "contact",
		title: "Questions",
		body: (
			<p>
				Anything unclear?{" "}
				<ContactLine message="Hi Tee Solar, I have a question about your privacy policy." />
				. You can also read our <Link to="/terms">terms of sale</Link>.
			</p>
		),
	},
];

function Privacy() {
	return (
		<LegalPage
			eyebrow="Privacy policy"
			title="Your privacy"
			intro={
				<p>
					The short version: we only collect what we need to sell, install and
					support your solar setup. We don't track you around this website, and
					we never sell your details.
				</p>
			}
			sections={sections}
		/>
	);
}
