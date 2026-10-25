import { createFileRoute } from "@tanstack/react-router";
import { WhatsAppButton } from "#/components/whatsapp-button";
import { site } from "#/data/site";

export const Route = createFileRoute("/contact")({
	head: () => ({ meta: [{ title: "Visit us | Tee Solar Inverters" }] }),
	component: Contact,
});

function Contact() {
	return (
		<div className="px-4 pt-12 md:px-8">
			<p className="label text-mute">Visit our shop</p>
			<h1 className="display mt-4 text-[15vw] md:text-[9vw]">
				Come see
				<br />
				it working
			</h1>

			<div className="mt-16 grid gap-px bg-line md:grid-cols-[1fr_1.5fr]">
				<div className="flex flex-col bg-card">
					<div className="border-b border-line p-8">
						<p className="label text-mute">Our shop</p>
						<p className="mt-3 text-2xl font-medium">{site.address}</p>
					</div>
					<div className="border-b border-line p-8">
						<p className="label text-mute">Call or WhatsApp</p>
						<a
							href={`tel:${site.phoneTel}`}
							className="mt-3 block text-2xl font-medium hover:underline"
						>
							{site.phoneDisplay}
						</a>
					</div>
					<div className="mt-auto p-8">
						<WhatsAppButton
							className="w-full"
							message="Hi Tee Solar, I'd like to come to the shop. What time do you open?"
						>
							Ask for opening hours
						</WhatsAppButton>
					</div>
				</div>
				<iframe
					title="Map to our shop"
					src={`https://maps.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=14&output=embed`}
					loading="lazy"
					className="min-h-[28rem] w-full border-0"
				/>
			</div>
		</div>
	);
}
