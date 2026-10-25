import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth";
import { can, type Permissions } from "#/lib/permissions";

/** The signed-in user, or null. Uses the cookie cache, so it's cheap enough for every page. */
export const getSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await auth.api.getSession({ headers: getRequestHeaders() });
		return session?.user ?? null;
	},
);

export class AuthError extends Error {}

/**
 * Guards a server function. Skips the cookie cache so a demoted or banned user loses
 * access straight away rather than when their cached session expires.
 */
export const requirePermission = (permissions?: Permissions) =>
	createMiddleware({ type: "function" }).server(async ({ next }) => {
		const headers = getRequestHeaders();
		const session = await auth.api.getSession({
			headers,
			query: { disableCookieCache: true },
		});
		if (!session) throw new AuthError("Please sign in again.");
		if (permissions && !can(session.user.role, permissions)) {
			throw new AuthError("You don't have permission to do that.");
		}
		return next({ context: { user: session.user, headers } });
	});
