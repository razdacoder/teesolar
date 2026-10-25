import { getRouteApi } from "@tanstack/react-router";
import { can, type Permissions } from "#/lib/permissions";

const adminRoute = getRouteApi("/admin");

/** The signed-in user and what they're allowed to do. Only works under /admin. */
export function useAdmin() {
	const { user } = adminRoute.useRouteContext();
	return {
		user,
		can: (permissions: Permissions) => can(user.role, permissions),
	};
}
