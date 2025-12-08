import { neon } from '@neondatabase/serverless';

// Database connection
const sql = neon(process.env.DATABASE_URL!);

export default sql;

// Re-export for convenience
export { sql };

// Helper type for query results
export type QueryResult<T> = T[];

// Helper to cast query results to a specific type
export function asType<T>(result: Record<string, unknown>[]): T[] {
   return result as T[];
}
