import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
	Button,
	Card,
	dateTime,
	ErrorText,
	Field,
	Input,
	PageHeader,
} from "#/components/admin/ui";
import { useAdmin } from "#/components/admin/use-admin";
import { authClient } from "#/lib/auth-client";
import { isRole, roleInfo } from "#/lib/permissions";
import { userKeys } from "#/queries/users";

export const Route = createFileRoute("/admin/account")({
	component: Account,
});

/** Better Auth's client returns `{ data, error }`; React Query wants a throw. */
async function unwrap<T>(
	call: Promise<
		{ data: T; error: null } | { data: null; error: { message?: string } }
	>,
) {
	const { data, error } = await call;
	if (error) throw new Error(error.message ?? "Something went wrong.");
	return data as T;
}

function Account() {
	const { user } = useAdmin();
	return (
		<div className="grid gap-8">
			<PageHeader
				title="Your account"
				description={`${user.email} · ${isRole(user.role) ? roleInfo[user.role].name : "No role"}`}
			/>
			<div className="grid gap-6 lg:grid-cols-2">
				<Profile />
				<Password />
			</div>
			<Sessions />
		</div>
	);
}

function Profile() {
	const { user } = useAdmin();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [name, setName] = useState(user.name);
	const save = useMutation({
		mutationFn: () => unwrap(authClient.updateUser({ name: name.trim() })),
		onSuccess: async () => {
			// Remove, not invalidate, so the layout's beforeLoad fetches the new name.
			queryClient.removeQueries({ queryKey: userKeys.session });
			await router.invalidate();
		},
	});

	return (
		<Card title="Profile">
			<form
				className="grid gap-4 p-5"
				onSubmit={(e) => {
					e.preventDefault();
					save.mutate();
				}}
			>
				<Field label="Name">
					<Input
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</Field>
				<Field label="Email" hint="Ask an admin if this needs to change.">
					<Input value={user.email} disabled />
				</Field>
				<ErrorText error={save.error} />
				<div className="flex items-center gap-3">
					<Button
						type="submit"
						disabled={save.isPending || name.trim() === user.name}
					>
						Save
					</Button>
					{save.isSuccess && (
						<span className="text-sm text-emerald-700">Saved.</span>
					)}
				</div>
			</form>
		</Card>
	);
}

function Password() {
	const [current, setCurrent] = useState("");
	const [next, setNext] = useState("");
	const [confirm, setConfirm] = useState("");
	const queryClient = useQueryClient();
	const change = useMutation({
		mutationFn: () =>
			unwrap(
				authClient.changePassword({
					currentPassword: current,
					newPassword: next,
					revokeOtherSessions: true,
				}),
			),
		onSuccess: () => {
			setCurrent("");
			setNext("");
			setConfirm("");
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
		},
	});
	const mismatch = confirm.length > 0 && confirm !== next;

	return (
		<Card title="Password">
			<form
				className="grid gap-4 p-5"
				onSubmit={(e) => {
					e.preventDefault();
					if (!mismatch) change.mutate();
				}}
			>
				<Field label="Current password">
					<Input
						type="password"
						autoComplete="current-password"
						required
						value={current}
						onChange={(e) => setCurrent(e.target.value)}
					/>
				</Field>
				<Field label="New password" hint="At least 8 characters.">
					<Input
						type="password"
						autoComplete="new-password"
						minLength={8}
						required
						value={next}
						onChange={(e) => setNext(e.target.value)}
					/>
				</Field>
				<Field
					label="Confirm new password"
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
				<ErrorText error={change.error} />
				<div className="flex items-center gap-3">
					<Button type="submit" disabled={change.isPending || mismatch}>
						Change password
					</Button>
					{change.isSuccess && (
						<span className="text-sm text-emerald-700">
							Changed. Other devices were signed out.
						</span>
					)}
				</div>
			</form>
		</Card>
	);
}

function Sessions() {
	const queryClient = useQueryClient();
	const { data: current } = authClient.useSession();
	const sessions = useQuery({
		queryKey: ["sessions"],
		queryFn: () => unwrap(authClient.listSessions()),
	});
	const signOutOthers = useMutation({
		mutationFn: () => unwrap(authClient.revokeOtherSessions()),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
	});
	const others = (sessions.data ?? []).filter(
		(s) => s.id !== current?.session.id,
	);

	return (
		<Card
			title="Signed-in devices"
			actions={
				others.length > 0 && (
					<Button
						variant="outline"
						size="sm"
						disabled={signOutOthers.isPending}
						onClick={() => signOutOthers.mutate()}
					>
						Sign out other devices
					</Button>
				)
			}
		>
			<ErrorText error={sessions.error ?? signOutOthers.error} />
			<ul>
				{(sessions.data ?? []).map((s) => (
					<li
						key={s.id}
						className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 text-sm last:border-0"
					>
						<div className="min-w-0">
							<p className="truncate">{describeDevice(s.userAgent)}</p>
							<p className="text-xs text-mute">
								{s.ipAddress || "Unknown IP"} · since{" "}
								{dateTime.format(new Date(s.createdAt))}
							</p>
						</div>
						{s.id === current?.session.id && (
							<span className="label text-emerald-700">This device</span>
						)}
					</li>
				))}
			</ul>
		</Card>
	);
}

function describeDevice(ua: string | null | undefined) {
	if (!ua) return "Unknown device";
	const browser = /Edg\//.test(ua)
		? "Edge"
		: /Chrome\//.test(ua)
			? "Chrome"
			: /Firefox\//.test(ua)
				? "Firefox"
				: /Safari\//.test(ua)
					? "Safari"
					: "Browser";
	const os = /Android/.test(ua)
		? "Android"
		: /iPhone|iPad/.test(ua)
			? "iOS"
			: /Windows/.test(ua)
				? "Windows"
				: /Mac OS/.test(ua)
					? "macOS"
					: /Linux/.test(ua)
						? "Linux"
						: "";
	return os ? `${browser} on ${os}` : browser;
}
