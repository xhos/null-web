"use client";

import { useState } from "react";
import type { Receipt } from "@/gen/null/v1/receipt_pb";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Muted } from "@/components/lib";

interface ReceiptImageDialogProps {
  receipt: Receipt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function resolveImageUrl(receipt: Receipt): string {
  if (receipt.imagePath.startsWith("http")) return receipt.imagePath;
  return `/api/receipts/${receipt.userId}/${receipt.id.toString()}/image`;
}

export function ReceiptImageDialog({ receipt, open, onOpenChange }: ReceiptImageDialogProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = resolveImageUrl(receipt);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setImageLoaded(false);
      setImageError(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">receipt image</DialogTitle>

        {imageError ? (
          <div className="p-12 text-center">
            <Muted size="sm">image not available</Muted>
          </div>
        ) : (
          <>
            {!imageLoaded && (
              <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">
                loading...
              </div>
            )}
            <img
              key={imageUrl}
              src={imageUrl}
              alt={receipt.merchant || "receipt"}
              className={`w-full object-contain max-h-[80vh] ${imageLoaded ? "block" : "hidden"}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
