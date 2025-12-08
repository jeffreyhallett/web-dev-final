import { vi } from 'vitest';

// Mock database results storage
let mockResults: Record<string, unknown>[] = [];
let mockError: Error | null = null;

// Mock SQL function that can be configured per test
export const mockSql = vi.fn().mockImplementation(() => {
   if (mockError) {
      throw mockError;
   }
   return Promise.resolve(mockResults);
});

// Helper to set mock results for the next query
export function setMockResults(results: Record<string, unknown>[]) {
   mockResults = results;
   mockError = null;
}

// Helper to set mock error for the next query
export function setMockError(error: Error) {
   mockError = error;
   mockResults = [];
}

// Helper to reset all mocks
export function resetMocks() {
   mockResults = [];
   mockError = null;
   mockSql.mockClear();
}

// Mock the database module
vi.mock('@/lib/db', () => ({
   sql: mockSql,
   asType: <T>(result: Record<string, unknown>[]): T[] => result as T[],
}));
