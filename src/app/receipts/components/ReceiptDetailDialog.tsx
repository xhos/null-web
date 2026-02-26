"use client";

import type { Receipt } from "@/gen/null/v1/receipt_pb";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatAmount, formatCurrency } from "@/lib/utils/transaction";
import { VStack, HStack, Caption, Muted } from "@/components/lib";
import { Link as LinkIcon } from "lucide-react";

interface ReceiptDetailDialogProps {
  receipt: Receipt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

function formatReceiptDate(date?: { year: number; month?: number; day?: number }) {
  if (!date) return null;
  const month = String(date.month || 1).padStart(2, "0");
  const day = String(date.day || 1).padStart(2, "0");
  return `${day}.${month}.${date.year}`;
}

export function ReceiptDetailDialog({ receipt, open, onOpenChange, isLoading }: ReceiptDetailDialogProps) {
  if (!open) return null;

  const currency = receipt?.total?.currencyCode || receipt?.currency || "USD";

  const formatMoney = (amount?: { units?: string | bigint; nanos?: number; currencyCode?: string }) => {
    if (!amount) return "—";
    const value = formatAmount(amount);
    return formatCurrency(value, amount.currencyCode || currency);
  };

  const items = receipt?.items || [];
  const confidence = receipt?.confidence ? Math.round(receipt.confidence * 100) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogTitle className="sr-only">receipt details</DialogTitle>

        {isLoading || !receipt ? (
          <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
            loading...
          </div>
        ) : (
          <VStack spacing="lg" className="w-full">
            <VStack spacing="xs" align="start">
              <div className="text-lg font-semibold">
                {receipt.merchant || "unknown merchant"}
              </div>
              {receipt.receiptDate && (
                <Muted size="sm">{formatReceiptDate(receipt.receiptDate)}</Muted>
              )}
            </VStack>

            {confidence !== null && (
              <HStack justify="between">
                <Caption>CONFIDENCE</Caption>
                <Muted size="xs" className="font-mono tabular-nums">{confidence}%</Muted>
              </HStack>
            )}

            {items.length > 0 && (
              <VStack spacing="sm" className="w-full">
                <Caption>ITEMS</Caption>
                <VStack spacing="xs" className="w-full">
                  {items.map((item) => (
                    <HStack key={item.id} justify="between" className="text-sm">
                      <span className="truncate mr-4">
                        {item.quantity !== 1 && (
                          <span className="text-muted-foreground">{item.quantity}× </span>
                        )}
                        {item.name || item.rawName}
                      </span>
                      <span className="font-mono tabular-nums flex-shrink-0 text-muted-foreground">
                        {formatMoney(item.unitPrice)}
                      </span>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            )}

            <VStack spacing="xs" className="w-full border-t border-border pt-4">
              {receipt.subtotal && (
                <HStack justify="between">
                  <Muted size="sm">subtotal</Muted>
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    {formatMoney(receipt.subtotal)}
                  </span>
                </HStack>
              )}
              {receipt.tax && (
                <HStack justify="between">
                  <Muted size="sm">tax</Muted>
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    {formatMoney(receipt.tax)}
                  </span>
                </HStack>
              )}
              <HStack justify="between" className="pt-1">
                <span className="text-sm font-semibold">total</span>
                <span className="font-mono font-semibold tabular-nums">
                  {formatMoney(receipt.total)}
                </span>
              </HStack>
            </VStack>

            {receipt.transactionId && (
              <HStack spacing="xs" className="text-xs text-muted-foreground">
                <LinkIcon className="h-3 w-3" />
                <span>linked to transaction #{receipt.transactionId.toString()}</span>
              </HStack>
            )}
          </VStack>
        )}
      </DialogContent>
    </Dialog>
  );
}
