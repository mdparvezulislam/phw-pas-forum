import "server-only";

import Typesense from "typesense";
import { getEnv } from "@/validations/env";

interface SearchResult {
  hits?: Array<{
    document: Record<string, unknown>;
    highlight?: Record<string, unknown>;
  }>;
  found: number;
  page: number;
  out_of: number;
}

interface CollectionSchema {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    facet?: boolean;
    optional?: boolean;
  }>;
  default_sorting_field?: string;
}

let _typesense: any = null;

function getTypesenseClient() {
  if (_typesense) return _typesense;

  const env = getEnv();

  _typesense = new Typesense.Client({
    nodes: [
      {
        host: env.TYPESENSE_HOST,
        port: env.TYPESENSE_PORT,
        protocol: env.TYPESENSE_PROTOCOL,
      },
    ],
    apiKey: env.TYPESENSE_API_KEY,
    connectionTimeoutSeconds: 5,
  });

  return _typesense;
}

export class SearchClient {
  private client: any;

  constructor() {
    this.client = getTypesenseClient();
  }

  async createCollection(schema: CollectionSchema): Promise<void> {
    try {
      await this.client.collections().create(schema);
    } catch (error: any) {
      if (error?.httpStatus === 409) return;
      throw error;
    }
  }

  async deleteCollection(name: string): Promise<void> {
    try {
      await this.client.collections(name).delete();
    } catch (error: any) {
      if (error?.httpStatus === 404) return;
      throw error;
    }
  }

  async indexDocument(
    collection: string,
    document: Record<string, unknown>,
  ): Promise<void> {
    await this.client.collections(collection).documents().upsert(document);
  }

  async indexDocuments(
    collection: string,
    documents: Record<string, unknown>[],
  ): Promise<void> {
    await this.client.collections(collection).documents().import_(documents);
  }

  async deleteDocument(collection: string, documentId: string): Promise<void> {
    try {
      await this.client.collections(collection).documents(documentId).delete();
    } catch (error: any) {
      if (error?.httpStatus === 404) return;
      throw error;
    }
  }

  async search(
    collection: string,
    query: string,
    options: {
      queryBy?: string;
      filterBy?: string;
      sortBy?: string;
      page?: number;
      perPage?: number;
    } = {},
  ): Promise<SearchResult> {
    return this.client
      .collections(collection)
      .documents()
      .search({
        q: query,
        query_by: options.queryBy ?? "name",
        filter_by: options.filterBy,
        sort_by: options.sortBy,
        page: options.page ?? 1,
        per_page: options.perPage ?? 20,
      });
  }

  async health(): Promise<boolean> {
    try {
      await this.client.health.retrieve();
      return true;
    } catch {
      return false;
    }
  }
}

export const search = new SearchClient();
