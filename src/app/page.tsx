"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AccountBalancesCard } from "@/components/dashboard/account-balances-card";
import { CategoryBreakdownCard } from "@/components/dashboard/category-breakdown-card";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { NetWorthChart } from "@/components/dashboard/net-worth-chart";
import { RecentTransactionsCard } from "@/components/dashboard/recent-transactions-card";
import { useSession, useUserId } from "@/hooks/useSession";

export default function HomePage() {
	const router = useRouter();
	const { data: session, isLoading } = useSession();
	const userId = useUserId();

	useEffect(() => {
		if (!isLoading && !session?.data?.user) {
			router.push("/login");
		}
	}, [isLoading, session, router]);

	if (isLoading || !userId) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="font-mono text-sm text-muted-foreground">
					loading...
				</div>
			</div>
		);
	}

	return (
		<div className="w-full p-4 lg:p-6">
			<div className="mx-auto max-w-[1600px] space-y-4">
				<DashboardStats userId={userId} />

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
					{/* Left Column */}
					<div className="space-y-4 lg:col-span-3">
						<AccountBalancesCard userId={userId} />
						<CategoryBreakdownCard userId={userId} />
					</div>

					{/* Center - Chart */}
					<div className="lg:col-span-6">
						<NetWorthChart userId={userId} />
					</div>

					{/* Right Column - Recent Transactions */}
					<div className="lg:col-span-3">
						<RecentTransactionsCard userId={userId} />
					</div>
				</div>
			</div>
		</div>
	);
}
