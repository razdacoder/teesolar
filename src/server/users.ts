import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { session, user } from "#/db/schema";
import { auth } from "#/lib/auth";
import { roleIds } from "#/lib/permissions";
import { requirePermission } from "./auth";

const userId = z.object({ userId: z.string().min(1) });

export const listUsers = createServerFn({ method: "GET" })
	.middleware([requirePermission({ user: ["list"] })])
	.handler(() =>
		db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				banned: user.banned,
				banReason: user.banReason,
				createdAt: user.createdAt,
				sessions: count(session.id),
			})
			.from(user)
			.leftJoin(session, eq(session.userId, user.id))
			.groupBy(user.id)
			.orderBy(asc(user.createdAt)),
	);

/** Stops the panel ending up with nobody who can manage users. */
async function assertNotLastAdmin(targetId: string) {
	const [target] = await db
		.select({ role: user.role })
		.from(user)
		.where(eq(user.id, targetId));
	if (target?.role !== "admin") return;
	const [{ others }] = await db
		.select({ others: count() })
		.from(user)
		.where(
			and(
				eq(user.role, "admin"),
				ne(user.id, targetId),
				eq(user.banned, false),
			),
		);
	if (others === 0) throw new Error("There has to be at least one admin.");
}

function assertNotSelf(currentId: string, targetId: string, action: string) {
	if (currentId === targetId) throw new Error(`You can't ${action} yourself.`);
}

export const setUserRole = createServerFn({ method: "POST" })
	.middleware([requirePermission({ user: ["set-role"] })])
	.validator(userId.extend({ role: z.enum(roleIds) }))
	.handler(async ({ data, context }) => {
		assertNotSelf(context.user.id, data.userId, "change the role of");
		if (data.role !== "admin") await assertNotLastAdmin(data.userId);
		await auth.api.setRole({
			body: { userId: data.userId, role: data.role },
			headers: context.headers,
		});
	});

export const banUser = createServerFn({ method: "POST" })
	.middleware([requirePermission({ user: ["ban"] })])
	.validator(userId.extend({ reason: z.string().trim().max(200).optional() }))
	.handler(async ({ data, context }) => {
		assertNotSelf(context.user.id, data.userId, "suspend");
		await assertNotLastAdmin(data.userId);
		// Banning also signs them out everywhere.
		await auth.api.banUser({
			body: { userId: data.userId, banReason: data.reason || undefined },
			headers: context.headers,
		});
	});

export const unbanUser = createServerFn({ method: "POST" })
	.middleware([requirePermission({ user: ["ban"] })])
	.validator(userId)
	.handler(async ({ data, context }) => {
		await auth.api.unbanUser({
			body: { userId: data.userId },
			headers: context.headers,
		});
	});

export const revokeUserSessions = createServerFn({ method: "POST" })
	.middleware([requirePermission({ session: ["revoke"] })])
	.validator(userId)
	.handler(async ({ data, context }) => {
		await auth.api.revokeUserSessions({
			body: { userId: data.userId },
			headers: context.headers,
		});
	});

export const removeUser = createServerFn({ method: "POST" })
	.middleware([requirePermission({ user: ["delete"] })])
	.validator(userId)
	.handler(async ({ data, context }) => {
		assertNotSelf(context.user.id, data.userId, "remove");
		await assertNotLastAdmin(data.userId);
		// Their stock movements stay; createdBy is set to null.
		await auth.api.removeUser({
			body: { userId: data.userId },
			headers: context.headers,
		});
	});
