"use client";

import { useState } from "react";
import type { Receipt } from "@/gen/null/v1/receipt_pb";
import { ReceiptStatus } from "@/gen/null/v1/receipt_pb";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HStack, VStack, Amount } from "@/components/lib";
import { FileImage, Trash2, Link as LinkIcon, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useReceipts, useReceipt } from "@/hooks/useReceipts";
import { formatAmount } from "@/lib/utils/transaction";
import { ReceiptDetailDialog } from "./ReceiptDetailDialog";

interface ReceiptItemProps {
  receipt: Receipt;
}

const statusConfig = {
  [ReceiptStatus.PENDING]: {
    label: "processing",
    className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    icon: Loader2,
    animate: true,
  },
  [ReceiptStatus.PARSED]: {
    label: "parsed",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    icon: CheckCircle2,
    animate: false,
  },
  [ReceiptStatus.LINKED]: {
    label: "linked",
    className: "bg-green-500/10 text-green-600 border-green-500/30",
    icon: CheckCircle2,
    animate: false,
  },
  [ReceiptStatus.FAILED]: {
    label: "failed",
    className: "bg-red-500/10 text-red-600 border-red-500/30",
    icon: XCircle,
    animate: false,
  },
  [ReceiptStatus.UNSPECIFIED]: {
    label: "unknown",
    className: "bg-gray-500/10 text-gray-600 border-gray-500/30",
    icon: Clock,
    animate: false,
  },
};

export function ReceiptItem({ receipt }: ReceiptItemProps) {
  const [selectedReceiptId, setSelectedReceiptId] = useState<bigint | null>(null);
  const { deleteReceipt, isDeleting } = useReceipts();
  const { data: receiptDetail, isLoading: isLoadingDetail } = useReceipt(selectedReceiptId);
  const status = statusConfig[receipt.status];
  const StatusIcon = status.icon;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this receipt?")) {
      deleteReceipt(receipt.id);
    }
  };

  const handleCardClick = () => {
    if (receipt.status === ReceiptStatus.PARSED || receipt.status === ReceiptStatus.LINKED) {
      setSelectedReceiptId(receipt.id);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) setSelectedReceiptId(null);
  };

  const isClickable = receipt.status === ReceiptStatus.PARSED || receipt.status === ReceiptStatus.LINKED;

  return (
    <>
    <Card
      className={`p-4 hover:border-primary/50 transition-colors ${isClickable ? "cursor-pointer" : ""}`}
      onClick={handleCardClick}
    >
      <HStack spacing="md" align="start">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
            <FileImage className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <VStack spacing="xs" className="flex-1 min-w-0">
          <HStack spacing="sm" justify="between" align="start">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">
                {receipt.merchant || "Unknown Merchant"}
              </h3>
              {receipt.receiptDate && (
                <p className="text-xs text-muted-foreground">
                  {new Date(
                    receipt.receiptDate.year,
                    (receipt.receiptDate.month || 1) - 1,
                    receipt.receiptDate.day || 1
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
            <Badge
              variant="outline"
              className={`${status.className} flex items-center gap-1.5`}
            >
              <StatusIcon className={`h-3 w-3 ${status.animate ? "animate-spin" : ""}`} />
              {status.label}
            </Badge>
          </HStack>

          <HStack spacing="sm" justify="between" align="center">
            <div className="flex items-center gap-2">
              {receipt.total && (
                <Amount
                  value={formatAmount(receipt.total)}
                  currency={receipt.total.currencyCode}
                  className="text-base font-semibold"
                />
              )}
              {receipt.transactionId && (
                <LinkIcon className="h-3 w-3 text-muted-foreground" />
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </HStack>

          <HStack spacing="sm" className="text-xs text-muted-foreground">
            {receipt.items && receipt.items.length > 0 && (
              <span>
                {receipt.items.length} item{receipt.items.length !== 1 ? "s" : ""}
              </span>
            )}
            {receipt.confidence && receipt.status === ReceiptStatus.PARSED && (
              <span className="text-xs">
                • {Math.round(receipt.confidence * 100)}% confidence
              </span>
            )}
          </HStack>
        </VStack>
      </HStack>
    </Card>

    <ReceiptDetailDialog
      receipt={receiptDetail?.receipt ?? null}
      open={selectedReceiptId !== null}
      onOpenChange={handleDialogClose}
      isLoading={isLoadingDetail}
    />
    </>
  );
}
