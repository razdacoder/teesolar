// Creates the first admin (or recovers access) by printing an admin invite link.
// Usage: pnpm admin:invite you@example.com
import { and, eq, isNull } from "drizzle-orm";
import { newInviteToken } from "#/lib/invite-token";
import { db } from "./index";
import { invitations, user } from "./schema";

const email = process.argv[2]?.trim().toLowerCase();
if (!email?.includes("@")) {
	console.error("Usage: pnpm admin:invite you@example.com");
	process.exit(1);
}

const [existing] = await db.select().from(user).where(eq(user.email, email));
if (existing) {
	console.error(`${email} already has an account (role: ${existing.role}).`);
	process.exit(1);
}

const { url, ...token } = newInviteToken(
	process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
);
await db
	.update(invitations)
	.set({ revokedAt: new Date() })
	.where(
		and(
			eq(invitations.email, email),
			isNull(invitations.acceptedAt),
			isNull(invitations.revokedAt),
		),
	);
await db.insert(invitations).values({ email, role: "admin", ...token });

console.log(`Admin invite for ${email} (valid 7 days):\n\n  ${url}\n`);
await db.$client.end();
