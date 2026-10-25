import { createHash, randomBytes } from "node:crypto";

export const INVITE_DAYS = 7;

export const hashInviteToken = (token: string) =>
	createHash("sha256").update(token).digest("hex");

/** A fresh token and its link. The token is never stored, only its hash. */
export function newInviteToken(origin: string) {
	const token = randomBytes(32).toString("base64url");
	return {
		tokenHash: hashInviteToken(token),
		url: `${origin}/admin/invite/${token}`,
		expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
	};
}
