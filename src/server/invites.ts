import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeaders } from "@tanstack/react-start/server";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { type Invitation, invitations, user } from "#/db/schema";
import { auth } from "#/lib/auth";
import { hashInviteToken as hash, newInviteToken } from "#/lib/invite-token";
import { isRole, roleIds } from "#/lib/permissions";
import { requirePermission } from "./auth";

const newToken = () =>
	newInviteToken(
		process.env.BETTER_AUTH_URL ?? new URL(getRequest().url).origin,
	);

export type InviteStatus = "pending" | "accepted" | "revoked" | "expired";

function statusOf(
	invite: Pick<Invitation, "acceptedAt" | "revokedAt" | "expiresAt">,
): InviteStatus {
	if (invite.acceptedAt) return "accepted";
	if (invite.revokedAt) return "revoked";
	if (invite.expiresAt < new Date()) return "expired";
	return "pending";
}

const open = and(isNull(invitations.acceptedAt), isNull(invitations.revokedAt));

// Admin

export const listInvites = createServerFn({ method: "GET" })
	.middleware([requirePermission({ invite: ["list"] })])
	.handler(async () => {
		const rows = await db
			.select({ invite: invitations, invitedBy: user.name })
			.from(invitations)
			.leftJoin(user, eq(user.id, invitations.invitedBy))
			.orderBy(desc(invitations.createdAt))
			.limit(100);
		return rows.map(({ invite: { tokenHash: _, ...invite }, invitedBy }) => ({
			...invite,
			invitedBy,
			status: statusOf(invite),
		}));
	});

export const createInvite = createServerFn({ method: "POST" })
	.middleware([requirePermission({ invite: ["create"] })])
	.validator(
		z.object({
			email: z.email("Enter a valid email").trim().toLowerCase(),
			role: z.enum(roleIds),
		}),
	)
	.handler(async ({ data, context }) => {
		const [existing] = await db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.email, data.email));
		if (existing) throw new Error(`${data.email} already has an account.`);

		const { url, ...token } = newToken();
		await db.transaction(async (tx) => {
			// One live invite per email: a new one replaces any older link.
			await tx
				.update(invitations)
				.set({ revokedAt: new Date() })
				.where(and(eq(invitations.email, data.email), open));
			await tx
				.insert(invitations)
				.values({ ...data, ...token, invitedBy: context.user.id });
		});
		return { url };
	});

/** Issues a new link (the old one stops working) and restarts the expiry clock. */
export const renewInvite = createServerFn({ method: "POST" })
	.middleware([requirePermission({ invite: ["create"] })])
	.validator(z.object({ id: z.uuid() }))
	.handler(async ({ data }) => {
		const { url, ...token } = newToken();
		const [invite] = await db
			.update(invitations)
			.set(token)
			.where(and(eq(invitations.id, data.id), open))
			.returning();
		if (!invite) throw new Error("That invite was already used or revoked.");
		return { url };
	});

export const revokeInvite = createServerFn({ method: "POST" })
	.middleware([requirePermission({ invite: ["revoke"] })])
	.validator(z.object({ id: z.uuid() }))
	.handler(async ({ data }) => {
		await db
			.update(invitations)
			.set({ revokedAt: new Date() })
			.where(and(eq(invitations.id, data.id), isNull(invitations.acceptedAt)));
	});

// Public: the person opening the link isn't signed in yet.

const token = z.object({ token: z.string().min(20).max(100) });

export const getInvite = createServerFn({ method: "GET" })
	.validator(token)
	.handler(async ({ data }) => {
		const [invite] = await db
			.select()
			.from(invitations)
			.where(eq(invitations.tokenHash, hash(data.token)));
		if (!invite) return null;
		return { email: invite.email, role: invite.role, status: statusOf(invite) };
	});

export const acceptInvite = createServerFn({ method: "POST" })
	.validator(
		token.extend({
			name: z.string().trim().min(1, "Enter your name"),
			password: z.string().min(8, "Use at least 8 characters").max(128),
		}),
	)
	.handler(async ({ data }) => {
		// Claim the invite first so the same link can't create two accounts.
		const [invite] = await db
			.update(invitations)
			.set({ acceptedAt: new Date() })
			.where(
				and(
					eq(invitations.tokenHash, hash(data.token)),
					isNull(invitations.acceptedAt),
					isNull(invitations.revokedAt),
					gt(invitations.expiresAt, new Date()),
				),
			)
			.returning();
		if (!invite || !isRole(invite.role)) {
			throw new Error("This invite link has expired or was already used.");
		}

		try {
			// Called without headers, createUser runs as the server rather than as a user.
			await auth.api.createUser({
				body: {
					email: invite.email,
					password: data.password,
					name: data.name,
					role: invite.role,
				},
			});
		} catch (error) {
			await db
				.update(invitations)
				.set({ acceptedAt: null })
				.where(eq(invitations.id, invite.id));
			throw error;
		}

		await auth.api.signInEmail({
			body: { email: invite.email, password: data.password },
			headers: getRequestHeaders(),
		});
	});
