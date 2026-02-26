"use client";

import { useState } from "react";
import type { Receipt } from "@/gen/null/v1/receipt_pb";
import { ReceiptStatus } from "@/gen/null/v1/receipt_pb";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HStack, VStack, Amount } from "@/components/lib";
import { Trash2, Link as LinkIcon, Loader2, CheckCircle2, XCircle, Clock, RefreshCw, Image as ImageIcon, FileText } from "lucide-react";
import { useReceipts, useReceipt } from "@/hooks/useReceipts";
import { useQueryClient } from "@tanstack/react-query";
import { formatAmount } from "@/lib/utils/transaction";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ReceiptDetailDialog } from "./ReceiptDetailDialog";
import { ReceiptImageDialog } from "./ReceiptImageDialog";
import { UploadReceiptDialog } from "./UploadReceiptDialog";

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

function formatReceiptDate(date?: { year: number; month?: number; day?: number }) {
  if (!date) return null;
  const month = String(date.month || 1).padStart(2, "0");
  const day = String(date.day || 1).padStart(2, "0");
  return `${day}.${month}.${date.year}`;
}

export function ReceiptItem({ receipt }: ReceiptItemProps) {
  const [selectedReceiptId, setSelectedReceiptId] = useState<bigint | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isRetryDialogOpen, setIsRetryDialogOpen] = useState(false);
  const { deleteReceipt, isDeleting } = useReceipts();
  const queryClient = useQueryClient();
  const { data: receiptDetail, isLoading: isLoadingDetail } = useReceipt(selectedReceiptId);

  const status = statusConfig[receipt.status];
  const StatusIcon = status.icon;
  const isFailed = receipt.status === ReceiptStatus.FAILED;
  const isViewable = receipt.status === ReceiptStatus.PARSED || receipt.status === ReceiptStatus.LINKED;
  const formattedDate = formatReceiptDate(receipt.receiptDate);

  const handleDelete = () => {
    if (confirm("delete this receipt?")) {
      deleteReceipt(receipt.id);
    }
  };

  const handleRetryComplete = () => {
    setIsRetryDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["receipts"] });
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Card
            className={`p-3 hover:border-primary/50 transition-colors duration-150 ${isViewable ? "cursor-pointer" : ""}`}
            onClick={() => { if (isViewable) setSelectedReceiptId(receipt.id); }}
          >
            <HStack spacing="md" justify="between" align="start">
              <VStack spacing="xs" className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">
                  {receipt.merchant || "unknown merchant"}
                </div>
                <HStack spacing="xs" className="text-xs text-muted-foreground flex-wrap">
                  {formattedDate && <span>{formattedDate}</span>}
                  {receipt.items && receipt.items.length > 0 && (
                    <>
                      {formattedDate && <span>·</span>}
                      <span>{receipt.items.length} item{receipt.items.length !== 1 ? "s" : ""}</span>
                    </>
                  )}
                  {receipt.confidence && receipt.status === ReceiptStatus.PARSED && (
                    <>
                      <span>·</span>
                      <span className="font-mono tabular-nums">{Math.round(receipt.confidence * 100)}% confidence</span>
                    </>
                  )}
                  {receipt.transactionId && <LinkIcon className="h-3 w-3" />}
                </HStack>
              </VStack>

              <VStack spacing="xs" align="end" className="shrink-0">
                {receipt.total && (
                  <Amount
                    value={formatAmount(receipt.total)}
                    currency={receipt.total.currencyCode}
                    className="text-sm font-semibold"
                  />
                )}
                <Badge
                  variant="outline"
                  className={`${status.className} flex items-center gap-1 text-xs px-1.5 py-0`}
                >
                  <StatusIcon className={`h-3 w-3 ${status.animate ? "animate-spin" : ""}`} />
                  {status.label}
                </Badge>
              </VStack>
            </HStack>
          </Card>
        </ContextMenuTrigger>

        <ContextMenuContent>
          {isViewable && (
            <ContextMenuItem onClick={() => setSelectedReceiptId(receipt.id)}>
              <FileText className="mr-2 h-4 w-4" />
              view details
            </ContextMenuItem>
          )}
          {receipt.imagePath && (
            <ContextMenuItem onClick={() => setIsImageDialogOpen(true)}>
              <ImageIcon className="mr-2 h-4 w-4" />
              view image
            </ContextMenuItem>
          )}
          {isFailed && (
            <ContextMenuItem onClick={() => setIsRetryDialogOpen(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              retry parsing
            </ContextMenuItem>
          )}
          <ContextMenuItem
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ReceiptDetailDialog
        receipt={receiptDetail?.receipt ?? null}
        open={selectedReceiptId !== null}
        onOpenChange={(open) => { if (!open) setSelectedReceiptId(null); }}
        isLoading={isLoadingDetail}
      />

      {isImageDialogOpen && (
        <ReceiptImageDialog
          receipt={receipt}
          open={isImageDialogOpen}
          onOpenChange={setIsImageDialogOpen}
        />
      )}

      {isFailed && (
        <UploadReceiptDialog
          open={isRetryDialogOpen}
          onOpenChange={setIsRetryDialogOpen}
          onUploadComplete={handleRetryComplete}
        />
      )}
    </>
  );
}
