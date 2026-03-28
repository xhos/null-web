"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VStack } from "@/components/lib";
import { Upload, FileImage, X } from "lucide-react";
import { useUser } from "@/hooks/useReceipts";
import { receiptsApi } from "@/lib/api/receipts";
import { toast } from "sonner";
import { ConnectError, Code } from "@connectrpc/connect";

interface UploadReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
  onDuplicate?: (existingReceiptId: bigint) => void;
}

function parseDuplicateReceiptId(message: string): bigint | null {
  const match = message.match(/\(id (\d+)\)/);
  return match ? BigInt(match[1]) : null;
}

export function UploadReceiptDialog({
  open,
  onOpenChange,
  onUploadComplete,
  onDuplicate,
}: UploadReceiptDialogProps) {
  const { user } = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateReceiptId, setDuplicateReceiptId] = useState<bigint | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = useCallback((file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!validTypes.includes(file.type)) {
      setError("invalid file type. please upload JPEG, PNG, WebP, or HEIC images.");
      return;
    }

    const maxSizeBytes = 16 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError("file too large. maximum size is 16MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handlePaste = (event: ClipboardEvent) => {
      const imageFile = Array.from(event.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith("image/")
      );
      if (imageFile) {
        event.preventDefault();
        validateAndSetFile(imageFile);
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [open, validateAndSetFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    setDuplicateReceiptId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) return;

    setIsUploading(true);
    setError(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      await receiptsApi.upload({
        userId: user.id,
        imageData: new Uint8Array(arrayBuffer),
        contentType: selectedFile.type,
      });

      toast.success("receipt uploaded", {
        description: "processing may take a few moments.",
      });

      clearFile();
      onUploadComplete();
    } catch (err) {
      const connectError = ConnectError.from(err);
      const rawMessage = err instanceof Error ? err.message : "";
      const isAlreadyExists =
        connectError.code === Code.AlreadyExists || rawMessage.includes("AlreadyExists");

      if (isAlreadyExists) {
        setDuplicateReceiptId(parseDuplicateReceiptId(rawMessage));
        setError(null);
      } else {
        setError("failed to upload receipt");
        toast.error("upload failed", { description: "failed to upload receipt" });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      clearFile();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>upload receipt</DialogTitle>
        </DialogHeader>

        <VStack spacing="md" className="py-4">
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-sm p-8 text-center cursor-pointer hover:border-primary transition-colors duration-150"
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                drag and drop, paste, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP, HEIC · max 16MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border border-border rounded-sm p-3 flex items-center gap-3">
              <FileImage className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 flex-shrink-0"
                onClick={clearFile}
                disabled={isUploading}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {duplicateReceiptId !== null && (
            <div className="bg-muted p-3 rounded-sm space-y-2">
              <p className="text-sm">this receipt has already been uploaded.</p>
              {onDuplicate && (
                <button
                  onClick={() => { onDuplicate(duplicateReceiptId); onOpenChange(false); }}
                  className="text-sm underline underline-offset-4 hover:text-muted-foreground transition-colors duration-150"
                >
                  view existing receipt
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-sm">
              {error}
            </div>
          )}
        </VStack>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? "uploading..." : "upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
