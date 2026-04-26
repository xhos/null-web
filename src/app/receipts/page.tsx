"use client";

import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Search, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { HStack, VStack } from "@/components/lib";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	PageContainer,
	PageContent,
	PageHeaderWithTitle,
} from "@/components/ui/layout";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ReceiptFilters } from "@/hooks/useReceipts";
import { useReceipt } from "@/hooks/useReceipts";
import { ReceiptDetailDialog } from "./components/ReceiptDetailDialog";
import { ReceiptFiltersPanel } from "./components/ReceiptFilters";
import { ReceiptList } from "./components/ReceiptList";
import { UploadReceiptDialog } from "./components/UploadReceiptDialog";

export default function ReceiptsPage() {
	const queryClient = useQueryClient();
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
	const [duplicateReceiptId, setDuplicateReceiptId] = useState<bigint | null>(
		null,
	);
	const [searchInput, setSearchInput] = useState("");
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [filters, setFilters] = useState<ReceiptFilters>({});
	const debouncedSearch = useDebouncedValue(searchInput, 300);
	const { data: duplicateReceiptData, isLoading: isDuplicateLoading } =
		useReceipt(duplicateReceiptId);

	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (
			filters.minTotalCents !== undefined ||
			filters.maxTotalCents !== undefined ||
			filters.currency
		)
			count++;
		if (filters.status !== undefined) count++;
		if (filters.unlinkedOnly) count++;
		return count;
	}, [filters]);

	const handleRefresh = () => {
		queryClient.invalidateQueries({ queryKey: ["receipts"] });
	};

	const handleUploadComplete = () => {
		setIsUploadDialogOpen(false);
		handleRefresh();
	};

	const activeFilters: ReceiptFilters = {
		...filters,
		query: debouncedSearch || undefined,
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
										value={searchInput}
										onChange={(e) => setSearchInput(e.target.value)}
									/>
								</div>
								<HStack spacing="xs">
									<Button onClick={handleRefresh} size="icon" variant="ghost">
										<RefreshCw className="h-4 w-4" />
									</Button>
									<Button
										onClick={() => setIsUploadDialogOpen(true)}
										size="icon"
									>
										<Upload className="h-4 w-4" />
									</Button>
								</HStack>
							</HStack>
							<Button
								variant="outline"
								size="sm"
								className="w-full rounded-sm"
								onClick={() => setIsFiltersOpen(!isFiltersOpen)}
							>
								filters
								{activeFilterCount > 0 && (
									<Badge
										variant="default"
										className="ml-2 h-5 min-w-5 px-1.5 text-[10px]"
									>
										{activeFilterCount}
									</Badge>
								)}
							</Button>
						</VStack>
						<ReceiptFiltersPanel
							filters={filters}
							onFiltersChange={setFilters}
							isOpen={isFiltersOpen}
						/>
					</div>

					{/* Main content */}
					<div className="flex-1 min-w-0 xl:order-2">
						<ReceiptList filters={activeFilters} />
					</div>

					{/* Desktop sidebar */}
					<aside className="hidden xl:block xl:flex-shrink-0 xl:sticky xl:top-8 xl:h-fit xl:w-80 xl:order-1">
						<VStack spacing="md">
							<HStack spacing="sm" justify="end">
								<Button onClick={handleRefresh} size="icon" variant="ghost">
									<RefreshCw className="h-4 w-4" />
								</Button>
								<Button
									onClick={() => setIsUploadDialogOpen(true)}
									size="default"
								>
									<Upload className="h-4 w-4" />
									upload
								</Button>
							</HStack>

							<div className="relative">
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="search"
									className="pl-9 border border-border rounded-sm"
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
								/>
							</div>

							<Button
								variant="outline"
								size="sm"
								className="w-full rounded-sm"
								onClick={() => setIsFiltersOpen(!isFiltersOpen)}
							>
								filters
								{activeFilterCount > 0 && (
									<Badge
										variant="default"
										className="ml-2 h-5 min-w-5 px-1.5 text-[10px]"
									>
										{activeFilterCount}
									</Badge>
								)}
							</Button>

							<ReceiptFiltersPanel
								filters={filters}
								onFiltersChange={setFilters}
								isOpen={isFiltersOpen}
							/>
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
					onOpenChange={(open) => {
						if (!open) setDuplicateReceiptId(null);
					}}
					isLoading={isDuplicateLoading}
				/>
			</PageContent>
		</PageContainer>
	);
}
