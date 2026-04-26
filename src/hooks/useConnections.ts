import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CreateConnectionInput,
	connectionsApi,
} from "@/lib/api/connections";
import { useUserId } from "./useSession";

export function useConnections() {
	const userId = useUserId();

	const {
		data: connections = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["connections", userId],
		queryFn: () => connectionsApi.list(),
		enabled: !!userId,
		staleTime: 60 * 1000,
	});

	return { connections, isLoading, error };
}

export function useCreateConnection() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (data: CreateConnectionInput) => connectionsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["connections"] });
		},
	});

	return {
		createConnection: mutation.mutate,
		createConnectionAsync: mutation.mutateAsync,
		isPending: mutation.isPending,
		error: mutation.error,
		reset: mutation.reset,
	};
}

export function useDeleteConnection() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (id: bigint) => connectionsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["connections"] });
		},
	});

	return {
		deleteConnection: mutation.mutate,
		deleteConnectionAsync: mutation.mutateAsync,
		isPending: mutation.isPending,
		error: mutation.error,
	};
}

export function useTriggerSync() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (id: bigint) => connectionsApi.triggerSync(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["connections"] });
		},
	});

	return {
		triggerSync: mutation.mutate,
		triggerSyncAsync: mutation.mutateAsync,
		isPending: mutation.isPending,
		error: mutation.error,
	};
}

export function useSetSyncInterval() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: ({
			id,
			syncIntervalMinutes,
		}: {
			id: bigint;
			syncIntervalMinutes: number | undefined;
		}) => connectionsApi.setSyncInterval(id, syncIntervalMinutes),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["connections"] });
		},
	});

	return {
		setSyncInterval: mutation.mutate,
		setSyncIntervalAsync: mutation.mutateAsync,
		isPending: mutation.isPending,
		error: mutation.error,
	};
}
