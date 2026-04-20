"use client";

import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import {
	Card,
	EmptyState,
	ErrorMessage,
	FormField,
	HStack,
	Input,
	LoadingSkeleton,
	Muted,
	SectionTitle,
	VStack,
} from "@/components/lib";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	PageContainer,
	PageContent,
	PageHeaderWithTitle,
} from "@/components/ui/layout";
import type { Connection } from "@/gen/null/v1/connection_services_pb";
import {
	useConnections,
	useCreateConnection,
	useDeleteConnection,
} from "@/hooks/useConnections";
import { useUserId } from "@/hooks/useSession";

const PROVIDER_LABEL: Record<string, string> = {
	wise: "Wise",
};

const STATUS_VARIANT: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
	active: "default",
	disabled: "secondary",
	broken: "destructive",
};

function providerLabel(provider: string) {
	return PROVIDER_LABEL[provider] ?? provider;
}

function timestampToDate(ts?: { seconds?: bigint; nanos?: number }) {
	if (!ts?.seconds) return null;
	return new Date(
		Number(ts.seconds) * 1000 + Math.floor((ts.nanos ?? 0) / 1e6),
	);
}

export default function SettingsPage() {
	const userId = useUserId();
	const { connections, isLoading } = useConnections();

	const hasWise = useMemo(
		() => connections.some((c) => c.provider === "wise"),
		[connections],
	);

	return (
		<PageContainer>
			<PageContent>
				<PageHeaderWithTitle
					title="settings"
					subtitle="Manage your account and data preferences"
				/>

				<VStack spacing="lg">
					<SectionTitle>connected accounts</SectionTitle>

					{!userId || isLoading ? (
						<LoadingSkeleton />
					) : connections.length === 0 ? (
						<EmptyState title="no connections yet" />
					) : (
						<VStack spacing="sm">
							{connections.map((c) => (
								<ConnectionRow key={c.id.toString()} connection={c} />
							))}
						</VStack>
					)}

					{!hasWise && <ConnectWiseCard />}
				</VStack>
			</PageContent>
		</PageContainer>
	);
}

function ConnectionRow({ connection }: { connection: Connection }) {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const { deleteConnectionAsync, isPending, error } = useDeleteConnection();

	const lastSyncedDate = timestampToDate(connection.lastSynced);
	const createdDate = timestampToDate(connection.createdAt);
	const errorMessage = error instanceof Error ? error.message : null;

	const onConfirm = async () => {
		await deleteConnectionAsync(connection.id);
		setConfirmOpen(false);
	};

	return (
		<Card padding="md">
			<HStack justify="between" align="center">
				<VStack spacing="xs">
					<HStack spacing="sm" align="center">
						<span className="font-medium">
							{providerLabel(connection.provider)}
						</span>
						<Badge variant={STATUS_VARIANT[connection.status] ?? "outline"}>
							{connection.status}
						</Badge>
					</HStack>
					<Muted size="xs">
						{lastSyncedDate
							? `synced ${formatDistanceToNow(lastSyncedDate, { addSuffix: true })}`
							: createdDate
								? `connected ${formatDistanceToNow(createdDate, { addSuffix: true })}`
								: "never synced"}
					</Muted>
				</VStack>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setConfirmOpen(true)}
					disabled={isPending}
				>
					Disconnect
				</Button>
			</HStack>

			{errorMessage && (
				<div className="mt-3">
					<ErrorMessage>{errorMessage}</ErrorMessage>
				</div>
			)}

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Disconnect {providerLabel(connection.provider)}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Sync will stop and the stored credentials will be removed.
							Existing transactions are kept.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={onConfirm} disabled={isPending}>
							{isPending ? "disconnecting…" : "Disconnect"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}

function ConnectWiseCard() {
	const [token, setToken] = useState("");
	const { createConnectionAsync, isPending, error, reset } =
		useCreateConnection();

	const errorMessage = error instanceof Error ? error.message : null;

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!token.trim()) return;
		await createConnectionAsync({
			provider: "wise",
			credentials: JSON.stringify({ api_token: token }),
		});
		setToken("");
	};

	return (
		<Card
			title="connect wise"
			description="Paste your Wise API token to enable transaction sync."
		>
			<form onSubmit={onSubmit} className="space-y-4">
				<FormField label="API token" required>
					<Input
						type="password"
						autoComplete="off"
						value={token}
						onChange={(e) => {
							setToken(e.target.value);
							if (error) reset();
						}}
						placeholder="wise api token"
						disabled={isPending}
						error={!!errorMessage}
					/>
				</FormField>
				{errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
				<div className="flex justify-end">
					<Button type="submit" disabled={isPending || !token.trim()}>
						{isPending ? "connecting…" : "connect"}
					</Button>
				</div>
			</form>
		</Card>
	);
}
