import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { AuthShell } from "#/components/admin/auth-shell";
import { Button, ErrorText, Field, Input } from "#/components/admin/ui";
import { authClient } from "#/lib/auth-client";
import { sessionQuery, userKeys } from "#/queries/users";

export const Route = createFileRoute("/admin_/login")({
	validateSearch: z.object({
		// Only same-site paths, so the link can't bounce people to another site.
		redirect: z
			.string()
			.regex(/^\/(?!\/)/)
			.optional()
			.catch(undefined),
	}),
	beforeLoad: async ({ context, search }) => {
		const user = await context.queryClient.ensureQueryData(sessionQuery());
		if (user) throw redirect({ href: search.redirect ?? "/admin" });
	},
	head: () => ({
		meta: [
			{ title: "Sign in | Tee Solar Admin" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: Login,
});

function Login() {
	const { redirect: next } = Route.useSearch();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const signIn = useMutation({
		mutationFn: async () => {
			const { error } = await authClient.signIn.email({ email, password });
			if (error) throw new Error(error.message ?? "Couldn't sign you in.");
		},
		onSuccess: async () => {
			// Remove rather than invalidate: beforeLoad's ensureQueryData would reuse a stale null.
			queryClient.removeQueries({ queryKey: userKeys.session });
			await router.navigate({ href: next ?? "/admin" });
		},
	});

	return (
		<AuthShell
			title="Sign in"
			description="For Tee Solar staff. Ask an admin for an invite if you don't have an account."
		>
			<form
				className="grid gap-4"
				onSubmit={(e) => {
					e.preventDefault();
					signIn.mutate();
				}}
			>
				<Field label="Email">
					<Input
						type="email"
						autoComplete="email"
						required
						autoFocus
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</Field>
				<Field label="Password">
					<Input
						type="password"
						autoComplete="current-password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</Field>
				<ErrorText error={signIn.error} />
				<Button type="submit" disabled={signIn.isPending} className="mt-2">
					{signIn.isPending ? "Signing in…" : "Sign in"}
				</Button>
			</form>
		</AuthShell>
	);
}
