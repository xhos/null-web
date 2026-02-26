"use client";

import { useState, useRef } from "react";
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

interface UploadReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

export function UploadReceiptDialog({
  open,
  onOpenChange,
  onUploadComplete,
}: UploadReceiptDialogProps) {
  const { user } = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!validTypes.includes(file.type)) {
      setError("invalid file type. please upload JPEG, PNG, WebP, or HEIC images.");
      return;
    }

    const maxSizeBytes = 20 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError("file too large. maximum size is 20MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

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
      const errorMessage = err instanceof Error ? err.message : "failed to upload receipt";
      setError(errorMessage);
      toast.error("upload failed", { description: errorMessage });
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
                drag and drop or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP, HEIC · max 20MB
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
