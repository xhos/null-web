"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import { X } from "lucide-react";
import { VStack, HStack, ErrorMessage, Muted, Caption } from "@/components/lib";
import type { Account } from "@/gen/null/v1/account_pb";
import { AccountType } from "@/gen/null/v1/enums_pb";
import { useAddAccountAlias, useRemoveAccountAlias } from "@/hooks/useAccounts";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
  onSave: (data: {
    name: string;
    bank: string;
    type: AccountType;
    friendlyName?: string;
    anchorBalance?: { currencyCode: string; units: string; nanos: number };
    mainCurrency?: string;
    colors?: string[];
  }) => Promise<void>;
  title: string;
}

export function AccountDialog({
  open,
  onOpenChange,
  account,
  onSave,
  title,
}: AccountDialogProps) {
  const [name, setName] = useState("");
  const [friendlyName, setFriendlyName] = useState("");
  const [bank, setBank] = useState("");
  const [type, setType] = useState<AccountType>(AccountType.ACCOUNT_CHEQUING);
  const [mainCurrency, setMainCurrency] = useState("USD");
  const [colors, setColors] = useState(["#1f2937", "#3b82f6", "#10b981"]);
  const [initialBalance, setInitialBalance] = useState("0");
  const [aliases, setAliases] = useState<string[]>([]);
  const [newAlias, setNewAlias] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addAliasAsync } = useAddAccountAlias();
  const { removeAliasAsync } = useRemoveAccountAlias();

  useEffect(() => {
    if (open) {
      if (account) {
        setName(account.name);
        setFriendlyName(account.friendlyName || "");
        setBank(account.bank);
        setType(account.type);
        setMainCurrency(account.mainCurrency || "USD");
        setColors(account.colors.length > 0 ? account.colors : ["#1f2937", "#3b82f6", "#10b981"]);
        setInitialBalance("0");
        setAliases(account.aliases.filter((a) => a !== account.name));
      } else {
        setName("");
        setFriendlyName("");
        setBank("");
        setType(AccountType.ACCOUNT_CHEQUING);
        setMainCurrency("USD");
        setColors(["#1f2937", "#3b82f6", "#10b981"]);
        setInitialBalance("0");
        setAliases([]);
      }
      setNewAlias("");
      setError(null);
    }
  }, [account, open]);

  const handleAddAlias = async () => {
    if (!account || !newAlias.trim()) return;
    if (aliases.includes(newAlias.trim())) return;
    await addAliasAsync({ accountId: account.id, alias: newAlias.trim() });
    setAliases((prev) => [...prev, newAlias.trim()]);
    setNewAlias("");
  };

  const handleRemoveAlias = async (alias: string) => {
    if (!account) return;
    await removeAliasAsync({ accountId: account.id, alias });
    setAliases((prev) => prev.filter((a) => a !== alias));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !bank) {
      setError("Name and bank are required");
      return;
    }

    setIsLoading(true);
    try {
      const data: Parameters<typeof onSave>[0] = {
        name,
        bank,
        type,
        friendlyName: friendlyName || undefined,
        mainCurrency,
        colors,
      };

      if (!account) {
        data.anchorBalance = {
          currencyCode: mainCurrency,
          units: Math.floor(parseFloat(initialBalance || "0")).toString(),
          nanos: Math.round((parseFloat(initialBalance || "0") % 1) * 1e9),
        };
      }

      await onSave(data);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <VStack spacing="md" className="py-4">
            <VStack spacing="xs">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my checking account"
                disabled={isLoading}
                required
              />
            </VStack>

            <VStack spacing="xs">
              <Label htmlFor="friendlyName">friendly name</Label>
              <Input
                id="friendlyName"
                value={friendlyName}
                onChange={(e) => setFriendlyName(e.target.value)}
                placeholder="Display name (optional)"
                disabled={isLoading}
              />
            </VStack>

            {account && (
              <VStack spacing="xs">
                <Label>aliases</Label>
                <VStack spacing="xs">
                  {aliases.length > 0 && (
                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {aliases.map((alias) => (
                        <HStack key={alias} spacing="sm" justify="between" align="center" className="rounded border px-3 py-1.5">
                          <Muted size="sm" className="font-mono truncate">{alias}</Muted>
                          <button
                            type="button"
                            onClick={() => handleRemoveAlias(alias)}
                            disabled={isLoading}
                            className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors duration-150"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </HStack>
                      ))}
                    </div>
                  )}
                  <HStack spacing="sm">
                    <Input
                      value={newAlias}
                      onChange={(e) => setNewAlias(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAlias())}
                      placeholder="add alias"
                      disabled={isLoading}
                      className="h-8 text-sm font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAlias}
                      disabled={isLoading || !newAlias.trim()}
                    >
                      add
                    </Button>
                  </HStack>
                </VStack>
              </VStack>
            )}

            <VStack spacing="xs">
              <Label htmlFor="bank">Bank *</Label>
              <Input
                id="bank"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="chase"
                disabled={isLoading}
                required
              />
            </VStack>

            <VStack spacing="xs">
              <Label htmlFor="type">type</Label>
              <Select
                value={type.toString()}
                onValueChange={(value) => setType(parseInt(value) as AccountType)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AccountType.ACCOUNT_CHEQUING.toString()}>chequing</SelectItem>
                  <SelectItem value={AccountType.ACCOUNT_SAVINGS.toString()}>savings</SelectItem>
                  <SelectItem value={AccountType.ACCOUNT_CREDIT_CARD.toString()}>credit card</SelectItem>
                  <SelectItem value={AccountType.ACCOUNT_INVESTMENT.toString()}>investment</SelectItem>
                  <SelectItem value={AccountType.ACCOUNT_OTHER.toString()}>other</SelectItem>
                </SelectContent>
              </Select>
            </VStack>

            <VStack spacing="xs">
              <Label htmlFor="currency">currency</Label>
              <Select
                value={mainCurrency}
                onValueChange={setMainCurrency}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
            </VStack>

            <VStack spacing="xs">
              <Label>colors</Label>
              <HStack spacing="sm">
                {colors.map((color, index) => (
                  <VStack key={index} spacing="xs" align="center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={isLoading}
                          className="h-12 w-12 cursor-pointer rounded border flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3">
                        <HexColorPicker
                          color={color}
                          onChange={(newColor) => {
                            const newColors = [...colors];
                            newColors[index] = newColor;
                            setColors(newColors);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <Caption size="xs">
                      {index === 0 ? "primary" : index === 1 ? "secondary" : "tertiary"}
                    </Caption>
                  </VStack>
                ))}
              </HStack>
            </VStack>

            {!account && (
              <VStack spacing="xs">
                <Label htmlFor="initialBalance">initial balance *</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  step="0.01"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="0.00"
                  disabled={isLoading}
                  required
                />
              </VStack>
            )}

            {error && <ErrorMessage>{error}</ErrorMessage>}
          </VStack>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "saving..." : "save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
