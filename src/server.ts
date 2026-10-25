import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { bootstrap } from "#/db/bootstrap";

// Migrate and seed before serving the first request. If this fails, the server doesn't start.
await bootstrap();

export default createServerEntry({
	fetch(request) {
		return handler.fetch(request);
	},
});
