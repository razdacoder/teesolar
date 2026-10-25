import { legal, site, whatsappLink } from "#/data/site";

export interface LegalSection {
	id: string;
	title: string;
	body: React.ReactNode;
}

export function LegalPage({
	eyebrow,
	title,
	intro,
	sections,
}: {
	eyebrow: string;
	title: string;
	intro: React.ReactNode;
	sections: LegalSection[];
}) {
	return (
		<div className="px-4 pt-12 md:px-8">
			<p className="label text-mute">
				{eyebrow} · Last updated {legal.updated}
			</p>
			<h1 className="display mt-4 text-[13vw] md:text-[7vw]">{title}</h1>
			<div className="mt-6 max-w-2xl text-lg text-mute">{intro}</div>

			<div className="mt-16 grid gap-12 border-t border-ink pt-10 lg:grid-cols-[16rem_1fr]">
				<nav
					aria-label="On this page"
					className="lg:sticky lg:top-28 lg:self-start"
				>
					<p className="label text-mute">On this page</p>
					<ul className="mt-4 space-y-2 text-sm">
						{sections.map((s) => (
							<li key={s.id}>
								<a href={`#${s.id}`} className="hover:underline">
									{s.title}
								</a>
							</li>
						))}
					</ul>
				</nav>

				<div className="max-w-2xl">
					{sections.map((s) => (
						<section
							key={s.id}
							id={s.id}
							className="scroll-mt-28 border-b border-line pb-10 not-first:pt-10 [&_a]:underline [&_li]:mt-2 [&_p]:mt-4 [&_strong]:font-semibold [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5"
						>
							<h2 className="text-2xl font-semibold">{s.title}</h2>
							{s.body}
						</section>
					))}
				</div>
			</div>
		</div>
	);
}

/** "WhatsApp or call 0813…" plus email when the business has one. */
export function ContactLine({
	message = "Hi Tee Solar, I have a question.",
}: {
	message?: string;
}) {
	return (
		<>
			WhatsApp or call us on{" "}
			<a href={whatsappLink(message)} target="_blank" rel="noreferrer">
				{site.phoneDisplay}
			</a>
			{legal.email && (
				<>
					, email <a href={`mailto:${legal.email}`}>{legal.email}</a>
				</>
			)}
			, or visit us at {site.address}
		</>
	);
}
