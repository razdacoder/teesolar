// Tables Better Auth needs (core + admin plugin), plus our own invitations.
// Field names follow Better Auth's defaults so the Drizzle adapter maps them without config.
import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
};

export const user = pgTable("user", {
	id: text().primaryKey(),
	name: text().notNull(),
	email: text().notNull().unique(),
	emailVerified: boolean().notNull().default(false),
	image: text(),
	// Admin plugin
	role: text(),
	banned: boolean().default(false),
	banReason: text(),
	banExpires: timestamp({ withTimezone: true }),
	...timestamps,
});

export const session = pgTable(
	"session",
	{
		id: text().primaryKey(),
		expiresAt: timestamp({ withTimezone: true }).notNull(),
		token: text().notNull().unique(),
		ipAddress: text(),
		userAgent: text(),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		// Admin plugin
		impersonatedBy: text(),
		...timestamps,
	},
	(t) => [index("session_user_idx").on(t.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text().primaryKey(),
		accountId: text().notNull(),
		providerId: text().notNull(),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text(),
		refreshToken: text(),
		idToken: text(),
		accessTokenExpiresAt: timestamp({ withTimezone: true }),
		refreshTokenExpiresAt: timestamp({ withTimezone: true }),
		scope: text(),
		password: text(),
		...timestamps,
	},
	(t) => [index("account_user_idx").on(t.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text().primaryKey(),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: timestamp({ withTimezone: true }).notNull(),
		...timestamps,
	},
	(t) => [index("verification_identifier_idx").on(t.identifier)],
);

/** Sign-up is closed; the only way in is an invite link an admin creates. */
export const invitations = pgTable(
	"invitations",
	{
		id: uuid().primaryKey().defaultRandom(),
		email: text().notNull(),
		role: text().notNull(),
		/** SHA-256 of the token in the link. The link itself is only shown once. */
		tokenHash: text().notNull().unique(),
		invitedBy: text().references(() => user.id, { onDelete: "set null" }),
		expiresAt: timestamp({ withTimezone: true }).notNull(),
		acceptedAt: timestamp({ withTimezone: true }),
		revokedAt: timestamp({ withTimezone: true }),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [index("invitations_email_idx").on(t.email)],
);

export type Invitation = typeof invitations.$inferSelect;
