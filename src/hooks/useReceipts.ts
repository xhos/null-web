import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { receiptsApi, type ListReceiptsInput } from "@/lib/api/receipts";
import { useUserId } from "./useSession";
import { ReceiptStatus } from "@/gen/arian/v1/receipt_pb";

interface UseReceiptsOptions {
  enabled?: boolean;
}

export function useReceipts({ enabled = true }: UseReceiptsOptions = {}) {
  const queryClient = useQueryClient();
  const userId = useUserId();

  const receiptsQuery = useQuery({
    queryKey: ["receipts", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      return receiptsApi.list({ userId });
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasPendingReceipts = data?.receipts.some(
        (r) => r.status === ReceiptStatus.PENDING
      );
      return hasPendingReceipts ? 3000 : false;
    },
  });

  const deleteReceiptMutation = useMutation({
    mutationFn: async (receiptId: bigint) => {
      if (!userId) throw new Error("User not authenticated");
      return receiptsApi.delete(userId, receiptId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
    },
  });

  return {
    receipts: receiptsQuery.data?.receipts ?? [],
    totalCount: receiptsQuery.data?.totalCount ?? BigInt(0),
    isLoading: receiptsQuery.isLoading,
    error: receiptsQuery.error,
    refetch: receiptsQuery.refetch,
    deleteReceipt: deleteReceiptMutation.mutate,
    isDeleting: deleteReceiptMutation.isPending,
    deleteError: deleteReceiptMutation.error,
  };
}

export function useUser() {
  const userId = useUserId();
  return { user: userId ? { id: userId } : null };
}
