"use client";

import { useReceipts } from "@/hooks/useReceipts";
import { VStack, EmptyState, LoadingSkeleton } from "@/components/lib";
import { ReceiptItem } from "./ReceiptItem";
import { Receipt as ReceiptIcon } from "lucide-react";

interface ReceiptListProps {
  refreshTrigger?: number;
}

export function ReceiptList({}: ReceiptListProps) {
  const { receipts, isLoading, error } = useReceipts();

  if (isLoading) {
    return <LoadingSkeleton lines={5} />;
  }

  if (error) {
    return (
      <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md">
        Failed to load receipts: {error.message}
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptIcon className="h-12 w-12" />}
        title="no receipts yet"
        description="upload your first receipt to get started"
      />
    );
  }

  return (
    <VStack spacing="sm">
      {receipts.map((receipt) => (
        <ReceiptItem key={receipt.id.toString()} receipt={receipt} />
      ))}
    </VStack>
  );
}
