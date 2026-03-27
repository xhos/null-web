"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageContainer, PageContent, PageHeaderWithTitle } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VStack, HStack } from "@/components/lib";
import { Search, RefreshCw, Upload } from "lucide-react";
import { ReceiptList } from "./components/ReceiptList";
import { UploadReceiptDialog } from "./components/UploadReceiptDialog";
import { ReceiptDetailDialog } from "./components/ReceiptDetailDialog";
import { useReceipt } from "@/hooks/useReceipts";

export default function ReceiptsPage() {
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [duplicateReceiptId, setDuplicateReceiptId] = useState<bigint | null>(null);
  const { data: duplicateReceiptData, isLoading: isDuplicateLoading } = useReceipt(duplicateReceiptId);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["receipts"] });
  };

  const handleUploadComplete = () => {
    setIsUploadDialogOpen(false);
    handleRefresh();
  };

  return (
    <PageContainer>
      <PageContent>
        <PageHeaderWithTitle title="receipts" />

        <div className="flex flex-col xl:flex-row xl:gap-8 gap-4">
          {/* Mobile toolbar */}
          <div className="xl:hidden">
            <VStack spacing="sm">
              <HStack spacing="sm" justify="between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="search"
                    className="pl-9 border border-border rounded-sm"
                  />
                </div>
                <HStack spacing="xs">
                  <Button onClick={handleRefresh} size="icon" variant="ghost">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => setIsUploadDialogOpen(true)} size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 xl:order-2">
            <ReceiptList />
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden xl:block xl:flex-shrink-0 xl:sticky xl:top-8 xl:h-fit xl:w-80 xl:order-1">
            <VStack spacing="md">
              <HStack spacing="sm" justify="end">
                <Button onClick={handleRefresh} size="icon" variant="ghost">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button onClick={() => setIsUploadDialogOpen(true)} size="default">
                  <Upload className="h-4 w-4" />
                  upload
                </Button>
              </HStack>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="search"
                  className="pl-9 border border-border rounded-sm"
                />
              </div>
            </VStack>
          </aside>
        </div>

        <UploadReceiptDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          onUploadComplete={handleUploadComplete}
          onDuplicate={setDuplicateReceiptId}
        />

        <ReceiptDetailDialog
          receipt={duplicateReceiptData?.receipt ?? null}
          linkCandidates={duplicateReceiptData?.linkCandidates}
          open={duplicateReceiptId !== null}
          onOpenChange={(open) => { if (!open) setDuplicateReceiptId(null); }}
          isLoading={isDuplicateLoading}
        />
      </PageContent>
    </PageContainer>
  );
}
