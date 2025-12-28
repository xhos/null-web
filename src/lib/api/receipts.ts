import { create } from "@bufbuild/protobuf";
import { receiptClient } from "@/lib/grpc-client";
import {
  ListReceiptsRequestSchema,
  UploadReceiptRequestSchema,
  GetReceiptRequestSchema,
  DeleteReceiptRequestSchema,
} from "@/gen/arian/v1/receipt_services_pb";
import type { ReceiptStatus } from "@/gen/arian/v1/receipt_pb";

export interface ListReceiptsInput {
  userId: string;
  limit?: number;
  offset?: number;
  status?: ReceiptStatus;
  unlinkedOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface UploadReceiptInput {
  userId: string;
  imageData: Uint8Array;
  contentType: string;
}

export const receiptsApi = {
  async list(data: ListReceiptsInput) {
    const request = create(ListReceiptsRequestSchema, {
      userId: data.userId,
      limit: data.limit || 50,
      offset: data.offset || 0,
      status: data.status,
      unlinkedOnly: data.unlinkedOnly,
      startDate: data.startDate
        ? {
            year: data.startDate.getFullYear(),
            month: data.startDate.getMonth() + 1,
            day: data.startDate.getDate(),
          }
        : undefined,
      endDate: data.endDate
        ? {
            year: data.endDate.getFullYear(),
            month: data.endDate.getMonth() + 1,
            day: data.endDate.getDate(),
          }
        : undefined,
    });
    const response = await receiptClient.listReceipts(request);
    return {
      receipts: response.receipts,
      totalCount: response.totalCount,
    };
  },

  async upload(data: UploadReceiptInput) {
    const request = create(UploadReceiptRequestSchema, {
      userId: data.userId,
      imageData: data.imageData,
      contentType: data.contentType,
    });
    const response = await receiptClient.uploadReceipt(request);
    return response.receipt;
  },

  async get(userId: string, id: bigint) {
    const request = create(GetReceiptRequestSchema, {
      userId,
      id,
    });
    const response = await receiptClient.getReceipt(request);
    return {
      receipt: response.receipt,
      linkCandidates: response.linkCandidates,
    };
  },

  async delete(userId: string, id: bigint) {
    const request = create(DeleteReceiptRequestSchema, {
      userId,
      id,
    });
    await receiptClient.deleteReceipt(request);
  },
};
