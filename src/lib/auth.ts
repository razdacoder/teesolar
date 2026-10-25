import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "#/db";
import { account, session, user, verification } from "#/db/schema";
import { ac, roles } from "./permissions";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: { user, session, account, verification },
	}),
	emailAndPassword: {
		enabled: true,
		// Accounts are only created from invites (see src/server/invites.ts).
		disableSignUp: true,
		minPasswordLength: 8,
	},
	session: {
		// Cache the session in a signed cookie so every admin page doesn't hit the database.
		cookieCache: { enabled: true, maxAge: 5 * 60 },
	},
	plugins: [
		admin({ ac, roles, defaultRole: "staff", adminRoles: ["admin"] }),
		// Must stay last so it sees every cookie the other plugins set.
		tanstackStartCookies(),
	],
});

export type Session = typeof auth.$Infer.Session;
