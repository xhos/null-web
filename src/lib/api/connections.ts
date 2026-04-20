import { create } from "@bufbuild/protobuf";
import {
	CreateConnectionRequestSchema,
	DeleteConnectionRequestSchema,
	ListConnectionsRequestSchema,
} from "@/gen/null/v1/connection_services_pb";
import { connectionsClient } from "@/lib/grpc-client";

export interface CreateConnectionInput {
	provider: string;
	credentials: string;
}

export const connectionsApi = {
	async list() {
		const request = create(ListConnectionsRequestSchema, {});
		const response = await connectionsClient.listConnections(request);
		return response.connections;
	},

	async create(data: CreateConnectionInput) {
		const request = create(CreateConnectionRequestSchema, {
			provider: data.provider,
			credentials: data.credentials,
		});
		const response = await connectionsClient.createConnection(request);
		return response.id;
	},

	async delete(id: bigint) {
		const request = create(DeleteConnectionRequestSchema, { id });
		await connectionsClient.deleteConnection(request);
	},
};
