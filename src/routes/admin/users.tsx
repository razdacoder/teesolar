import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Check, Copy, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import {
	Badge,
	Button,
	Card,
	ConfirmButton,
	Dialog,
	date,
	Empty,
	ErrorText,
	Field,
	Input,
	PageHeader,
	Select,
} from "#/components/admin/ui";
import { useAdmin } from "#/components/admin/use-admin";
import { can, isRole, type Role, roleIds, roleInfo } from "#/lib/permissions";
import {
	invitesQuery,
	useBanUser,
	useCreateInvite,
	useRemoveUser,
	useRenewInvite,
	useRevokeInvite,
	useRevokeUserSessions,
	usersQuery,
	useSetUserRole,
	useUnbanUser,
} from "#/queries/users";
import type { InviteStatus } from "#/server/invites";

export const Route = createFileRoute("/admin/users")({
	beforeLoad: ({ context }) => {
		if (!can(context.user.role, { user: ["list"] })) {
			throw redirect({ to: "/admin" });
		}
	},
	loader: ({ context: { queryClient } }) =>
		Promise.all([
			queryClient.ensureQueryData(usersQuery()),
			queryClient.ensureQueryData(invitesQuery()),
		]),
	component: UsersPage,
});

function UsersPage() {
	const [inviting, setInviting] = useState(false);
	return (
		<div className="grid gap-8">
			<PageHeader
				title="Users"
				description="People who can sign in to this admin. New people join by invite only."
				actions={
					<Button onClick={() => setInviting(true)}>
						<UserPlus className="size-4" aria-hidden="true" /> Invite someone
					</Button>
				}
			/>
			<RoleGuide />
			<UserTable />
			<InviteTable />
			<Dialog
				open={inviting}
				onClose={() => setInviting(false)}
				title="Invite someone"
			>
				<InviteForm />
			</Dialog>
		</div>
	);
}

function RoleGuide() {
	return (
		<div className="grid gap-px border border-line bg-line sm:grid-cols-3">
			{roleIds.map((r) => (
				<div key={r} className="bg-card p-4">
					<p className="font-medium">{roleInfo[r].name}</p>
					<p className="mt-1 text-sm text-mute">{roleInfo[r].description}</p>
				</div>
			))}
		</div>
	);
}

function UserTable() {
	const { user: me } = useAdmin();
	const { data: users } = useSuspenseQuery(usersQuery());
	const setRole = useSetUserRole();
	const ban = useBanUser();
	const unban = useUnbanUser();
	const revoke = useRevokeUserSessions();
	const remove = useRemoveUser();

	return (
		<Card title={`Team · ${users.length}`} className="overflow-x-auto">
			<ErrorText error={setRole.error ?? unban.error} />
			<table className="w-full min-w-[760px] text-left text-sm">
				<thead className="border-b border-line">
					<tr className="label text-mute">
						<th className="px-5 py-3 font-normal">Person</th>
						<th className="px-3 py-3 font-normal">Role</th>
						<th className="px-3 py-3 font-normal">Status</th>
						<th className="px-3 py-3 font-normal">Joined</th>
						<th className="px-5 py-3">
							<span className="sr-only">Actions</span>
						</th>
					</tr>
				</thead>
				<tbody>
					{users.map((u) => {
						const self = u.id === me.id;
						return (
							<tr key={u.id} className="border-b border-line last:border-0">
								<td className="px-5 py-3">
									<p className="font-medium">
										{u.name} {self && <span className="text-mute">(you)</span>}
									</p>
									<p className="text-xs text-mute">{u.email}</p>
								</td>
								<td className="px-3 py-3">
									<Select
										aria-label={`Role for ${u.name}`}
										value={isRole(u.role) ? u.role : ""}
										disabled={self || setRole.isPending}
										onChange={(e) =>
											setRole.mutate({
												data: { userId: u.id, role: e.target.value as Role },
											})
										}
										className="h-8 w-32"
									>
										{!isRole(u.role) && <option value="">No role</option>}
										{roleIds.map((r) => (
											<option key={r} value={r}>
												{roleInfo[r].name}
											</option>
										))}
									</Select>
								</td>
								<td className="px-3 py-3">
									{u.banned ? (
										<span title={u.banReason ?? undefined}>
											<Badge tone="red">Suspended</Badge>
										</span>
									) : u.sessions > 0 ? (
										<Badge tone="green">Signed in</Badge>
									) : (
										<Badge>Active</Badge>
									)}
								</td>
								<td className="px-3 py-3 text-mute">
									{date.format(new Date(u.createdAt))}
								</td>
								<td className="px-5 py-3">
									{!self && (
										<div className="flex justify-end gap-1">
											{u.banned ? (
												<Button
													variant="ghost"
													size="sm"
													disabled={unban.isPending}
													onClick={() =>
														unban.mutate({ data: { userId: u.id } })
													}
												>
													Restore
												</Button>
											) : (
												<ConfirmButton
													variant="ghost"
													size="sm"
													title={`Suspend ${u.name}?`}
													message="They'll be signed out straight away and can't sign in until you restore them."
													confirmLabel="Suspend"
													pending={ban.isPending}
													error={ban.error}
													onConfirm={() =>
														ban.mutateAsync({ data: { userId: u.id } })
													}
												>
													Suspend
												</ConfirmButton>
											)}
											{u.sessions > 0 && (
												<ConfirmButton
													variant="ghost"
													size="sm"
													title={`Sign ${u.name} out?`}
													message="Ends their sessions on every device. They can sign in again."
													confirmLabel="Sign out"
													pending={revoke.isPending}
													error={revoke.error}
													onConfirm={() =>
														revoke.mutateAsync({ data: { userId: u.id } })
													}
												>
													Sign out
												</ConfirmButton>
											)}
											<ConfirmButton
												variant="ghost"
												size="sm"
												title={`Remove ${u.name}?`}
												message="Their account is deleted. Stock they recorded stays in the history."
												confirmLabel="Remove"
												pending={remove.isPending}
												error={remove.error}
												onConfirm={() =>
													remove.mutateAsync({ data: { userId: u.id } })
												}
												className="!text-red-700"
											>
												Remove
											</ConfirmButton>
										</div>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</Card>
	);
}

const statusTone: Record<InviteStatus, "sun" | "green" | "neutral" | "red"> = {
	pending: "sun",
	accepted: "green",
	revoked: "neutral",
	expired: "red",
};

function InviteTable() {
	const { data: invites } = useSuspenseQuery(invitesQuery());
	const renew = useRenewInvite();
	const revoke = useRevokeInvite();
	const [link, setLink] = useState<{
		email: string;
		role: string;
		url: string;
	} | null>(null);
	const open = invites.filter((i) => i.status !== "accepted");

	return (
		<Card title="Invites" className="overflow-x-auto">
			{open.length === 0 ? (
				<Empty>No open invites.</Empty>
			) : (
				<table className="w-full min-w-[720px] text-left text-sm">
					<thead className="border-b border-line">
						<tr className="label text-mute">
							<th className="px-5 py-3 font-normal">Email</th>
							<th className="px-3 py-3 font-normal">Role</th>
							<th className="px-3 py-3 font-normal">Status</th>
							<th className="px-3 py-3 font-normal">Invited by</th>
							<th className="px-3 py-3 font-normal">Expires</th>
							<th className="px-5 py-3">
								<span className="sr-only">Actions</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{open.map((i) => (
							<tr key={i.id} className="border-b border-line last:border-0">
								<td className="px-5 py-3">{i.email}</td>
								<td className="px-3 py-3">
									{isRole(i.role) ? roleInfo[i.role].name : i.role}
								</td>
								<td className="px-3 py-3">
									<Badge tone={statusTone[i.status]}>{i.status}</Badge>
								</td>
								<td className="px-3 py-3 text-mute">
									{i.invitedBy ?? "Setup"}
								</td>
								<td className="px-3 py-3 text-mute">
									{date.format(new Date(i.expiresAt))}
								</td>
								<td className="px-5 py-3">
									{i.status !== "revoked" && (
										<div className="flex justify-end gap-1">
											<Button
												variant="ghost"
												size="sm"
												disabled={renew.isPending}
												onClick={() =>
													renew.mutate(
														{ data: { id: i.id } },
														{
															onSuccess: ({ url }) =>
																setLink({ email: i.email, role: i.role, url }),
														},
													)
												}
											>
												New link
											</Button>
											{i.status === "pending" && (
												<ConfirmButton
													variant="ghost"
													size="sm"
													title="Revoke invite?"
													message={`The link sent to ${i.email} will stop working.`}
													confirmLabel="Revoke"
													pending={revoke.isPending}
													error={revoke.error}
													onConfirm={() =>
														revoke.mutateAsync({ data: { id: i.id } })
													}
													className="!text-red-700"
												>
													Revoke
												</ConfirmButton>
											)}
										</div>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
			<ErrorText error={renew.error} />
			<Dialog
				open={link !== null}
				onClose={() => setLink(null)}
				title="New invite link"
			>
				{link && <InviteLink {...link} />}
			</Dialog>
		</Card>
	);
}

function InviteForm() {
	const create = useCreateInvite();
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<Role>("staff");

	if (create.data) {
		return <InviteLink email={email} role={role} url={create.data.url} />;
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				create.mutate({ data: { email, role } });
			}}
			className="grid gap-5"
		>
			<Field label="Email">
				<Input
					type="email"
					required
					autoFocus
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</Field>
			<fieldset className="grid gap-2">
				<legend className="label mb-1.5 text-mute">Role</legend>
				{roleIds.map((r) => (
					<label
						key={r}
						className={`flex items-start gap-3 border p-3 ${role === r ? "border-ink bg-card" : "border-line"}`}
					>
						<input
							type="radio"
							name="role"
							value={r}
							checked={role === r}
							onChange={() => setRole(r)}
							className="mt-1 accent-ink"
						/>
						<span>
							<span className="block text-sm font-medium">
								{roleInfo[r].name}
							</span>
							<span className="block text-xs text-mute">
								{roleInfo[r].description}
							</span>
						</span>
					</label>
				))}
			</fieldset>
			<ErrorText error={create.error} />
			<Button type="submit" disabled={create.isPending}>
				{create.isPending ? "Creating…" : "Create invite link"}
			</Button>
		</form>
	);
}

/** Shown once: only a hash of the token is stored, so the link can't be shown again. */
function InviteLink({
	email,
	role,
	url,
}: {
	email: string;
	role: string;
	url: string;
}) {
	const [copied, setCopied] = useState(false);
	const roleName = isRole(role) ? roleInfo[role].name : role;
	const message = `You've been invited to the Tee Solar admin as ${roleName}. Set up your account here (the link works for 7 days): ${url}`;

	return (
		<div className="grid gap-4 text-sm">
			<p>
				Send this link to <strong>{email}</strong>. It works once, for 7 days.
				You won't be able to see it again, but you can make a new one.
			</p>
			<div className="flex gap-2">
				<Input readOnly value={url} onFocus={(e) => e.target.select()} />
				<Button
					variant="outline"
					onClick={() =>
						navigator.clipboard.writeText(url).then(() => setCopied(true))
					}
				>
					{copied ? (
						<Check className="size-4" aria-hidden="true" />
					) : (
						<Copy className="size-4" aria-hidden="true" />
					)}
					{copied ? "Copied" : "Copy"}
				</Button>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<a
					// No number, so WhatsApp lets you pick who to send it to.
					href={`https://wa.me/?text=${encodeURIComponent(message)}`}
					target="_blank"
					rel="noreferrer"
					className="label inline-flex h-10 items-center justify-center bg-whatsapp text-ink"
				>
					Share on WhatsApp
				</a>
				<a
					href={`mailto:${email}?subject=${encodeURIComponent("Your Tee Solar admin invite")}&body=${encodeURIComponent(message)}`}
					className="label inline-flex h-10 items-center justify-center gap-2 border border-line bg-card hover:border-ink"
				>
					<Mail className="size-4" aria-hidden="true" /> Email
				</a>
			</div>
		</div>
	);
}
