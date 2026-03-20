import { create } from "@bufbuild/protobuf";
import { accountClient } from "@/lib/grpc-client";
import {
  ListAccountsRequestSchema,
  CreateAccountRequestSchema,
  UpdateAccountRequestSchema,
  DeleteAccountRequestSchema,
  AddAccountAliasRequestSchema,
  RemoveAccountAliasRequestSchema,
  SetAccountAliasesRequestSchema,
  FindAccountByAliasRequestSchema,
} from "@/gen/null/v1/account_services_pb";
import { AccountType } from "@/gen/null/v1/enums_pb";

export interface CreateAccountInput {
  userId: string;
  name: string;
  bank: string;
  type: AccountType;
  friendlyName?: string;
  anchorBalance?: {
    currencyCode: string;
    units: string;
    nanos: number;
  };
  mainCurrency?: string;
  colors?: string[];
}

export interface UpdateAccountInput {
  userId: string;
  id: bigint;
  name: string;
  bank: string;
  accountType: AccountType;
  friendlyName?: string;
  mainCurrency?: string;
  colors?: string[];
}

export interface SetAnchorBalanceInput {
  userId: string;
  id: bigint;
  balance: {
    currencyCode: string;
    units: string;
    nanos: number;
  };
}

export const accountsApi = {
  async list(userId: string) {
    const request = create(ListAccountsRequestSchema, { userId });
    const response = await accountClient.listAccounts(request);
    return response.accounts;
  },

  async create(data: CreateAccountInput) {
    const request = create(CreateAccountRequestSchema, {
      userId: data.userId,
      name: data.name,
      bank: data.bank,
      type: data.type,
      friendlyName: data.friendlyName,
      anchorBalance: data.anchorBalance ? {
        currencyCode: data.anchorBalance.currencyCode,
        units: BigInt(data.anchorBalance.units),
        nanos: data.anchorBalance.nanos,
      } : undefined,
      mainCurrency: data.mainCurrency,
      colors: data.colors,
    });
    const response = await accountClient.createAccount(request);
    return response.account;
  },

  async update(data: UpdateAccountInput) {
    const request = create(UpdateAccountRequestSchema, {
      userId: data.userId,
      id: data.id,
      updateMask: { paths: ["name", "bank", "account_type", "friendly_name", "main_currency", "colors"] },
      name: data.name,
      bank: data.bank,
      accountType: data.accountType,
      friendlyName: data.friendlyName,
      mainCurrency: data.mainCurrency,
      colors: data.colors,
    });
    await accountClient.updateAccount(request);
  },

  async delete(userId: string, id: bigint) {
    const request = create(DeleteAccountRequestSchema, {
      userId,
      id,
    });
    await accountClient.deleteAccount(request);
  },

  async addAlias(accountId: bigint, alias: string) {
    const request = create(AddAccountAliasRequestSchema, { accountId, alias });
    await accountClient.addAccountAlias(request);
  },

  async removeAlias(accountId: bigint, alias: string) {
    const request = create(RemoveAccountAliasRequestSchema, { accountId, alias });
    await accountClient.removeAccountAlias(request);
  },

  async setAliases(accountId: bigint, aliases: string[]) {
    const request = create(SetAccountAliasesRequestSchema, { accountId, aliases });
    await accountClient.setAccountAliases(request);
  },

  async findByAlias(alias: string) {
    const request = create(FindAccountByAliasRequestSchema, { alias });
    const response = await accountClient.findAccountByAlias(request);
    return response.account;
  },

  async setAnchorBalance(data: SetAnchorBalanceInput) {
    const request = create(UpdateAccountRequestSchema, {
      userId: data.userId,
      id: data.id,
      updateMask: { paths: ["anchor_balance", "anchor_date"] },
      anchorBalance: data.balance ? {
        currencyCode: data.balance.currencyCode,
        units: BigInt(data.balance.units),
        nanos: data.balance.nanos,
      } : undefined,
      anchorDate: { seconds: BigInt(Math.floor(Date.now() / 1000)) },
    });
    await accountClient.updateAccount(request);
  },
};
