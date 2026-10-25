// Roles for the admin panel. Shared by the server (which enforces them) and the client
// (which only uses them to hide controls a user can't use).
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const statement = {
	...defaultStatements,
	product: ["create", "update", "delete"],
	stock: ["adjust"],
	invite: ["create", "list", "revoke"],
} as const;

export const ac = createAccessControl(statement);

export const roles = {
	admin: ac.newRole({
		...adminAc.statements,
		product: ["create", "update", "delete"],
		stock: ["adjust"],
		invite: ["create", "list", "revoke"],
	}),
	manager: ac.newRole({
		product: ["create", "update", "delete"],
		stock: ["adjust"],
	}),
	staff: ac.newRole({
		stock: ["adjust"],
	}),
};

export type Role = keyof typeof roles;
export const roleIds = Object.keys(roles) as Role[];

export const roleInfo: Record<Role, { name: string; description: string }> = {
	admin: {
		name: "Admin",
		description: "Everything, including inviting and removing users.",
	},
	manager: {
		name: "Manager",
		description: "Adds and edits products, and records stock.",
	},
	staff: {
		name: "Staff",
		description: "Records sales and restocks. Can't change products.",
	},
};

export type Permissions = {
	[K in keyof typeof statement]?: (typeof statement)[K][number][];
};

export function isRole(value: unknown): value is Role {
	return typeof value === "string" && value in roles;
}

export function can(role: string | null | undefined, permissions: Permissions) {
	if (!isRole(role)) return false;
	return roles[role].authorize(permissions).success;
}
