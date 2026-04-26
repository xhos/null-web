import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";

export function useCurrencies() {
	const { data, isLoading } = useQuery({
		queryKey: ["currencies"],
		queryFn: () => dashboardApi.getCurrencies(),
		staleTime: Infinity,
	});

	return {
		currencies: data ?? [],
		isLoading,
	};
}
