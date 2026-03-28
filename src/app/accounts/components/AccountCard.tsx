"use client";

import type { Account } from "@/gen/null/v1/account_pb";
import { AccountType } from "@/gen/null/v1/enums_pb";
import { Card, VStack, HStack, Muted, Caption, Text } from "@/components/lib";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Pencil, Trash2, Anchor, Merge } from "lucide-react";

interface AccountCardProps {
  account: Account;
  getAccountTypeName: (type: AccountType) => string;
  onClick: () => void;
  onEdit?: (account: Account) => void;
  onDelete?: (account: Account) => void;
  onSetAnchor?: (account: Account) => void;
  onMerge?: (account: Account) => void;
}

export default function AccountCard({ account, getAccountTypeName, onClick, onEdit, onDelete, onSetAnchor, onMerge }: AccountCardProps) {
  const formatBalance = (balance?: {
    currencyCode?: string;
    units?: string | bigint;
    nanos?: number;
  }) => {
    if (!balance) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: account.mainCurrency || "USD",
      }).format(0);
    }

    const unitsAmount = parseFloat(balance.units?.toString() || "0");
    const nanosAmount = (balance.nanos || 0) / 1e9;
    const totalAmount = unitsAmount + nanosAmount;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: account.mainCurrency || balance.currencyCode,
    }).format(totalAmount);
  };

  const [c1, c2, c3] = account.colors.length === 3 ? account.colors : [null, null, null];
  const blobGradient = c1 && c2 && c3 ? {
    background: `
      radial-gradient(circle at 90% 60%, ${c3} 0%, transparent 50%),
      radial-gradient(circle at 70% 5%,  ${c2} 0%, transparent 45%),
      radial-gradient(circle at 20% 75%, ${c1} 0%, transparent 50%)
    `,
  } : undefined;

  const hasGradient = !!blobGradient;

  const cardContent = (
    <Card variant="default" padding="sm" interactive onClick={onClick} className="group relative overflow-hidden aspect-[85.6/54] !rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {hasGradient && (
        <div
          className="absolute -inset-4 blur-2xl pointer-events-none grayscale scale-110 opacity-30 dark:opacity-20 group-hover:grayscale-0 group-hover:scale-100 group-hover:opacity-100 dark:group-hover:opacity-60 transition-all duration-700 ease-out"
          style={blobGradient}
        />
      )}
      <div className={`flex flex-col justify-between h-full relative ${hasGradient ? "dark:group-hover:text-white" : ""}`}>
        <HStack justify="between" align="start">
          <Caption className={hasGradient ? "dark:group-hover:text-white/60" : ""}>{account.bank}</Caption>
          <Muted size="xs" className={hasGradient ? "dark:group-hover:text-white/50" : ""}>{getAccountTypeName(account.type)}</Muted>
        </HStack>
        <VStack spacing="xs" align="start">
          <Text weight="semibold" size="lg" className={hasGradient ? "dark:group-hover:text-white" : ""}>{formatBalance(account.balance)}</Text>
          <Text size="sm" className={hasGradient ? "dark:group-hover:text-white/70" : ""}>{account.friendlyName || account.name}</Text>
        </VStack>
      </div>
    </Card>
  );

  if (onEdit || onDelete || onSetAnchor || onMerge) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {cardContent}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {onEdit && (
            <ContextMenuItem onClick={() => onEdit(account)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </ContextMenuItem>
          )}
          {onSetAnchor && (
            <ContextMenuItem onClick={() => onSetAnchor(account)}>
              <Anchor className="mr-2 h-4 w-4" />
              Set Anchor Balance
            </ContextMenuItem>
          )}
          {onMerge && (
            <ContextMenuItem onClick={() => onMerge(account)}>
              <Merge className="mr-2 h-4 w-4" />
              Merge into...
            </ContextMenuItem>
          )}
          {onDelete && (
            <ContextMenuItem onClick={() => onDelete(account)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return cardContent;
}
