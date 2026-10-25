import { useEffect, useRef, useState } from "react";

// TikTok's official embed player: video only, true 9:16, no caption/author chrome.
// https://developers.tiktok.com/doc/embed-player
const PLAYER_PARAMS = new URLSearchParams({
	music_info: "0",
	description: "0",
	rel: "0",
	native_context_menu: "0",
	closed_caption: "0",
}).toString();

export function TikTokEmbed({ id, title }: { id: string; title: string }) {
	const ref = useRef<HTMLDivElement>(null);
	const [near, setNear] = useState(false);
	const [loaded, setLoaded] = useState(false);

	// Only mount the iframe when it scrolls near view — each player is heavy.
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setNear(true);
					io.disconnect();
				}
			},
			{ rootMargin: "300px" },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	return (
		<figure className="flex flex-col bg-card">
			<div
				ref={ref}
				className="relative aspect-[9/16] w-full overflow-hidden bg-ink"
			>
				{!loaded && (
					<div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
						<output
							className="size-9 animate-spin rounded-full border-2 border-paper/15 border-t-sun"
							aria-label="Loading video"
						/>
						<span className="label text-paper/50">Loading video</span>
					</div>
				)}
				{near && (
					<iframe
						src={`https://www.tiktok.com/player/v1/${id}?${PLAYER_PARAMS}`}
						title={title}
						allow="fullscreen; encrypted-media; picture-in-picture"
						onLoad={() => setLoaded(true)}
						className={`absolute inset-0 size-full border-0 transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
					/>
				)}
			</div>
			<figcaption className="p-4 text-sm leading-snug font-medium">
				{title}
			</figcaption>
		</figure>
	);
}
