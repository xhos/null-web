"use client";

import { useEffect, useState } from "react";
import { ErrorMessage, FormField, Input, VStack } from "@/components/lib";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateConnection } from "@/hooks/useConnections";
import {
	INTERVAL_OPTIONS,
	type Provider,
	parseIntervalValue,
} from "../providers";

interface ConnectProviderDialogProps {
	provider: Provider | null;
	onOpenChange: (open: boolean) => void;
}

export function ConnectProviderDialog({
	provider,
	onOpenChange,
}: ConnectProviderDialogProps) {
	const open = !!provider;
	const [values, setValues] = useState<Record<string, string>>({});
	const [intervalValue, setIntervalValue] = useState<string>("1440");
	const { createConnectionAsync, isPending, error, reset } =
		useCreateConnection();

	useEffect(() => {
		if (open) {
			setValues({});
			setIntervalValue("1440");
			reset();
		}
	}, [open, reset]);

	if (!provider) return null;

	const errorMessage = error instanceof Error ? error.message : null;
	const allFilled = provider.fields.every((f) => values[f.key]?.trim());

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!allFilled) return;
		await createConnectionAsync({
			provider: provider.slug,
			credentials: JSON.stringify(values),
			syncIntervalMinutes: parseIntervalValue(intervalValue),
		});
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>connect {provider.label}</DialogTitle>
					<DialogDescription>{provider.description}</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit}>
					<VStack spacing="md" className="py-2">
						{provider.fields.map((field) => (
							<FormField key={field.key} label={field.label} required>
								<Input
									type={field.type ?? "text"}
									autoComplete="off"
									value={values[field.key] ?? ""}
									onChange={(e) => {
										setValues((prev) => ({
											...prev,
											[field.key]: e.target.value,
										}));
										if (error) reset();
									}}
									placeholder={field.placeholder}
									disabled={isPending}
									error={!!errorMessage}
								/>
							</FormField>
						))}

						<FormField label="sync frequency">
							<Select
								value={intervalValue}
								onValueChange={setIntervalValue}
								disabled={isPending}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{INTERVAL_OPTIONS.map((o) => (
										<SelectItem key={o.value} value={o.value}>
											{o.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>

						{errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
					</VStack>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
						>
							cancel
						</Button>
						<Button type="submit" disabled={isPending || !allFilled}>
							{isPending ? "connecting..." : "connect"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
