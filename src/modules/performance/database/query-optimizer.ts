import "server-only";
import { logger } from "@/lib/logger";

interface QueryAnalysis {
  query: string;
  duration: number;
  rowsScanned: number;
  rowsReturned: number;
  sequentialScan: boolean;
  indexScan: boolean;
  suggestion: string | null;
}

interface QueryPattern {
  pattern: RegExp;
  optimization: string;
  severity: "warning" | "error" | "info";
}

const KNOWN_N_PLUS_ONE_PATTERNS: QueryPattern[] = [
  {
    pattern: /SELECT\s+.*\s+FROM\s+\w+\s+WHERE\s+\w+\.id\s+=\s+\$1/i,
    optimization: "Consider batch loading with IN clause",
    severity: "warning",
  },
  {
    pattern: /SELECT\s+\*\s+FROM/i,
    optimization: "Select only needed columns instead of *",
    severity: "warning",
  },
  {
    pattern: /ORDER\s+BY\s+RANDOM\(\)/i,
    optimization: "Use ORDER BY random() with indexed column or table sample",
    severity: "error",
  },
  {
    pattern: /LIKE\s+'%[^']+'/i,
    optimization:
      "Leading wildcard LIKE prevents index usage, use pg_trgm or full-text search",
    severity: "error",
  },
  {
    pattern: /NOT\s+IN\s*\(\s*SELECT/i,
    optimization: "NOT IN can be slow, prefer NOT EXISTS or LEFT JOIN",
    severity: "warning",
  },
  {
    pattern: /OFFSET\s+\d+/i,
    optimization:
      "Deep OFFSET is slow, use keyset pagination (WHERE id > last_id)",
    severity: "warning",
  },
  {
    pattern: /COUNT\s*\(\s*\*\s*\)\s+FROM\s+(\w+)\s+WHERE/i,
    optimization: "Consider cached counter or materialized view",
    severity: "info",
  },
];

export class QueryOptimizerService {
  analyzeQuery(query: string, durationMs: number): QueryAnalysis {
    const suggestion = this.getOptimizationSuggestion(query);
    return {
      query: query.substring(0, 200),
      duration: durationMs,
      rowsScanned: 0,
      rowsReturned: 0,
      sequentialScan: this.hasSequentialScan(query),
      indexScan: this.hasIndexScan(query),
      suggestion,
    };
  }

  private getOptimizationSuggestion(query: string): string | null {
    for (const pattern of KNOWN_N_PLUS_ONE_PATTERNS) {
      if (pattern.pattern.test(query)) {
        return `[${pattern.severity.toUpperCase()}] ${pattern.optimization}`;
      }
    }
    return null;
  }

  private hasSequentialScan(query: string): boolean {
    const seqScanIndicators = [
      /WHERE\s+\w+\s+LIKE\s+'%[^']+/i,
      /WHERE\s+EXTRACT\(/i,
      /WHERE\s+CAST\(/i,
      /WHERE\s+LOWER\(/i,
      /WHERE\s+UPPER\(/i,
      /OR\s+\w+\s+!=\s+\w+/i,
    ];
    return seqScanIndicators.some((p) => p.test(query));
  }

  private hasIndexScan(query: string): boolean {
    return /\bWHERE\b.*\b=\s*\$\d/.test(query);
  }

  suggestBatchLoading(entityType: string, ids: string[]): string {
    const key =
      entityType === "threads" ? "id" : `${entityType.slice(0, -1)}_id`;
    return `Replace N+1 queries on ${entityType} with: WHERE ${key} = ANY($1)`;
  }

  suggestKeysetPagination(table: string, sortColumn: string): string {
    return `Replace OFFSET pagination on ${table} with: WHERE ${sortColumn} > $last_value ORDER BY ${sortColumn} LIMIT $limit`;
  }

  suggestCoveringIndex(table: string, columns: string[]): string {
    return `Consider covering index: CREATE INDEX ON ${table} (${columns.join(", ")}) INCLUDE (extra_columns)`;
  }

  async logSlowQuery(
    query: string,
    durationMs: number,
    userId?: string,
  ): Promise<void> {
    if (durationMs > 1000) {
      logger.warn("[QueryOptimizer] Slow query detected", {
        duration: `${durationMs}ms`,
        query: query.substring(0, 500),
        userId,
        suggestion: this.getOptimizationSuggestion(query),
      });
    }
    if (durationMs > 5000) {
      logger.error(
        "[QueryOptimizer] Critical slow query",
        new Error("Slow query"),
        {
          duration: `${durationMs}ms`,
          query: query.substring(0, 500),
          userId,
        },
      );
    }
  }
}

export const queryOptimizerService = new QueryOptimizerService();
