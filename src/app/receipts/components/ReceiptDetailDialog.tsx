"use client";

import type { Receipt } from "@/gen/arian/v1/receipt_pb";
import { ReceiptStatus } from "@/gen/arian/v1/receipt_pb";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatAmount, formatCurrency } from "@/lib/utils/transaction";

interface ReceiptDetailDialogProps {
  receipt: Receipt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

function formatReceiptDate(date?: { year: number; month?: number; day?: number }) {
  if (!date) return "—";
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
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-zinc-950 border border-zinc-800" showCloseButton={false}>
        <DialogTitle className="sr-only">receipt details</DialogTitle>

        <div className="font-mono text-zinc-300">
          {isLoading || !receipt ? (
            <div className="p-8 text-center text-sm text-zinc-500 animate-pulse">
              loading...
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-zinc-900 px-4 py-2 text-[10px] text-zinc-500 tracking-widest">
                RCP/{receipt.id}
              </div>

              <div className="p-4 space-y-4">
                {/* Merchant - big and bold */}
                <div>
                  <div className="text-xl font-semibold text-zinc-100 leading-tight tracking-tight">
                    {receipt.merchant || "Unknown"}
                  </div>
                  <div className="text-xs text-zinc-600 mt-1">
                    {formatReceiptDate(receipt.receiptDate)}
                  </div>
                </div>

                {/* Confidence */}
                {confidence !== null && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                    <span className="text-zinc-500 tabular-nums">{confidence}%</span>
                  </div>
                )}

                {/* Items */}
                {items.length > 0 && (
                  <div className="border-t border-zinc-800 pt-3 space-y-1.5 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="truncate mr-4 text-zinc-300">
                          {item.quantity !== 1 && <span className="text-zinc-500">{item.quantity}× </span>}
                          {item.name || item.rawName}
                        </span>
                        <span className="tabular-nums flex-shrink-0 text-zinc-400">{formatMoney(item.unitPrice)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals */}
                <div className="border-t border-zinc-800 pt-3 space-y-1">
                  {receipt.subtotal && (
                    <div className="flex justify-between text-xs text-zinc-600">
                      <span>Subtotal</span>
                      <span className="tabular-nums">{formatMoney(receipt.subtotal)}</span>
                    </div>
                  )}
                  {receipt.tax && (
                    <div className="flex justify-between text-xs text-zinc-600">
                      <span>Tax</span>
                      <span className="tabular-nums">{formatMoney(receipt.tax)}</span>
                    </div>
                    )}
                  <div className="flex justify-between text-lg font-semibold text-zinc-100 pt-1">
                    <span>Total</span>
                    <span className="tabular-nums">{formatMoney(receipt.total)}</span>
                  </div>
                </div>

                {/* Link status */}
                {receipt.transactionId && (
                  <div className="text-xs text-zinc-600 flex items-center gap-1.5">
                    <span className="text-emerald-500">●</span>
                    <span>Linked to tx #{receipt.transactionId}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-zinc-900/50 border-t border-zinc-800 px-4 py-2 text-[10px] text-zinc-700">
                ·:·:·:·:·:·:·:·:·:·:·:·:·:·:·:·:·:·:·:·:·:·:·:·
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
