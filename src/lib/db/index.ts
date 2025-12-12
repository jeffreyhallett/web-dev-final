import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default sql;

export { sql };

export type QueryResult<T> = T[];

export function asType<T>(result: Record<string, unknown>[]): T[] {
   return result as T[];
}
