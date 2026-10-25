import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "#/components/admin/auth-shell";
import { Button, ErrorText, Field, Input } from "#/components/admin/ui";
import { isRole, roleInfo } from "#/lib/permissions";
import { inviteQuery, userKeys } from "#/queries/users";
import { acceptInvite } from "#/server/invites";

export const Route = createFileRoute("/admin_/invite/$token")({
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(inviteQuery(params.token)),
	head: () => ({
		meta: [
			{ title: "Join | Tee Solar Admin" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: AcceptInvite,
});

const unusable = {
	accepted:
		"This invite has already been used. Sign in with the account you set up.",
	revoked: "This invite was cancelled. Ask an admin for a new one.",
	expired: "This invite has expired. Ask an admin for a new link.",
};

function AcceptInvite() {
	const { token } = Route.useParams();
	const { data: invite } = useSuspenseQuery(inviteQuery(token));

	if (!invite || invite.status !== "pending") {
		return (
			<AuthShell
				title="Invite not valid"
				description={
					invite && invite.status in unusable
						? unusable[invite.status as keyof typeof unusable]
						: "We couldn't find this invite. Check you copied the whole link."
				}
			>
				<Link
					to="/admin/login"
					className="label inline-flex h-10 w-full items-center justify-center bg-ink text-paper hover:bg-ink/85"
				>
					Go to sign in
				</Link>
			</AuthShell>
		);
	}

	const role = isRole(invite.role) ? roleInfo[invite.role] : null;
	return (
		<AuthShell
			title="Join Tee Solar admin"
			description={
				<>
					You've been invited as <strong>{role?.name ?? invite.role}</strong>.{" "}
					{role?.description}
				</>
			}
		>
			<AcceptForm token={token} email={invite.email} />
		</AuthShell>
	);
}

function AcceptForm({ token, email }: { token: string; email: string }) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const mismatch = confirm.length > 0 && confirm !== password;

	const accept = useMutation({
		mutationFn: () => acceptInvite({ data: { token, name, password } }),
		onSuccess: async () => {
			// Remove rather than invalidate: beforeLoad's ensureQueryData would reuse a stale null.
			queryClient.removeQueries({ queryKey: userKeys.session });
			await router.navigate({ to: "/admin" });
		},
	});

	return (
		<form
			className="grid gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				if (!mismatch) accept.mutate();
			}}
		>
			<Field label="Email">
				<Input value={email} disabled />
			</Field>
			<Field label="Your name">
				<Input
					required
					autoFocus
					autoComplete="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
			</Field>
			<Field label="Choose a password" hint="At least 8 characters.">
				<Input
					type="password"
					autoComplete="new-password"
					minLength={8}
					required
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</Field>
			<Field
				label="Confirm password"
				error={mismatch ? "Passwords don't match" : undefined}
			>
				<Input
					type="password"
					autoComplete="new-password"
					required
					value={confirm}
					onChange={(e) => setConfirm(e.target.value)}
				/>
			</Field>
			<ErrorText error={accept.error} />
			<Button
				type="submit"
				disabled={accept.isPending || mismatch}
				className="mt-2"
			>
				{accept.isPending ? "Setting up…" : "Create account"}
			</Button>
		</form>
	);
}
