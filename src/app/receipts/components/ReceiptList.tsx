"use client";

import { useReceipts, type ReceiptFilters } from "@/hooks/useReceipts";
import { EmptyState, LoadingSkeleton } from "@/components/lib";
import { ReceiptItem } from "./ReceiptItem";
import { Receipt as ReceiptIcon } from "lucide-react";

interface ReceiptListProps {
  filters?: ReceiptFilters;
}

export function ReceiptList({ filters }: ReceiptListProps) {
  const { receipts, isLoading, error } = useReceipts(filters);

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
    <div className="columns-[280px] gap-4">
      {receipts.map((receipt) => (
        <div key={receipt.id.toString()} className="break-inside-avoid mb-4">
          <ReceiptItem receipt={receipt} />
        </div>
      ))}
    </div>
  );
}
