import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SplitEntryInput, splitsApi } from "@/lib/api/splits";
import { useUserId } from "./useSession";

export function useFriendBalances() {
	const userId = useUserId();

	return useQuery({
		queryKey: ["friendBalances", userId],
		queryFn: async () => {
			if (!userId) throw new Error("User not authenticated");
			return splitsApi.getFriendBalances(userId);
		},
		enabled: !!userId,
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	});
}

export function useSplitTransaction() {
	const userId = useUserId();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			sourceTransactionId,
			splits,
		}: {
			sourceTransactionId: bigint;
			splits: SplitEntryInput[];
		}) => {
			if (!userId) throw new Error("User not authenticated");
			return splitsApi.splitTransaction(userId, sourceTransactionId, splits);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			queryClient.invalidateQueries({ queryKey: ["friendBalances"] });
			queryClient.invalidateQueries({ queryKey: ["accounts"] });
		},
	});
}

export function useForgiveTransaction() {
	const userId = useUserId();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			transactionId,
			forgiven,
		}: {
			transactionId: bigint;
			forgiven: boolean;
		}) => {
			if (!userId) throw new Error("User not authenticated");
			return splitsApi.forgiveTransaction(userId, transactionId, forgiven);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			queryClient.invalidateQueries({ queryKey: ["friendBalances"] });
		},
	});
}
