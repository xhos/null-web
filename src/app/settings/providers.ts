export type ProviderField = {
	key: string;
	label: string;
	placeholder?: string;
	type?: "password" | "text";
};

export type Provider = {
	slug: string;
	label: string;
	description: string;
	fields: ProviderField[];
	comingSoon?: boolean;
};

export const INTERVAL_OPTIONS = [
	{ label: "manual only", value: "manual" },
	{ label: "hourly", value: "60" },
	{ label: "every 6 hours", value: "360" },
	{ label: "daily", value: "1440" },
	{ label: "weekly", value: "10080" },
] as const;

export const PROVIDERS: Provider[] = [
	{
		slug: "wise",
		label: "wise",
		description:
			"pulls multi-currency balances and transactions from your wise account.",
		fields: [
			{
				key: "api_token",
				label: "api token",
				placeholder: "wise api token",
				type: "password",
			},
		],
	},
	{
		slug: "snaptrade",
		label: "snaptrade",
		description:
			"brokerage positions and trades across supported investment accounts.",
		fields: [
			{ key: "snaptrade_user_id", label: "user id", type: "text" },
			{ key: "user_secret", label: "user secret", type: "password" },
		],
		comingSoon: true,
	},
];

export function intervalToValue(minutes: number | undefined): string {
	return minutes === undefined ? "manual" : String(minutes);
}

export function parseIntervalValue(value: string): number | undefined {
	return value === "manual" ? undefined : Number(value);
}

export function intervalLabel(minutes: number | undefined): string {
	const match = INTERVAL_OPTIONS.find(
		(o) => o.value === intervalToValue(minutes),
	);
	return match?.label ?? "manual only";
}
