import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { getSession } from "#/server/auth";
import {
	createInvite,
	getInvite,
	listInvites,
	renewInvite,
	revokeInvite,
} from "#/server/invites";
import {
	banUser,
	listUsers,
	removeUser,
	revokeUserSessions,
	setUserRole,
	unbanUser,
} from "#/server/users";

export const userKeys = {
	session: ["session"] as const,
	all: ["users"] as const,
	list: () => [...userKeys.all, "list"] as const,
	invites: () => [...userKeys.all, "invites"] as const,
	invite: (token: string) => [...userKeys.all, "invite", token] as const,
};

export const sessionQuery = () =>
	queryOptions({
		queryKey: userKeys.session,
		queryFn: () => getSession(),
		staleTime: 5 * 60_000,
	});

export const usersQuery = () =>
	queryOptions({ queryKey: userKeys.list(), queryFn: () => listUsers() });

export const invitesQuery = () =>
	queryOptions({ queryKey: userKeys.invites(), queryFn: () => listInvites() });

export const inviteQuery = (token: string) =>
	queryOptions({
		queryKey: userKeys.invite(token),
		queryFn: () => getInvite({ data: { token } }),
		staleTime: 0,
	});

function useUserMutation<TArgs, TResult>(
	fn: (args: TArgs) => Promise<TResult>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: fn,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
	});
}

export const useSetUserRole = () => useUserMutation(setUserRole);
export const useBanUser = () => useUserMutation(banUser);
export const useUnbanUser = () => useUserMutation(unbanUser);
export const useRevokeUserSessions = () => useUserMutation(revokeUserSessions);
export const useRemoveUser = () => useUserMutation(removeUser);
export const useCreateInvite = () => useUserMutation(createInvite);
export const useRenewInvite = () => useUserMutation(renewInvite);
export const useRevokeInvite = () => useUserMutation(revokeInvite);
