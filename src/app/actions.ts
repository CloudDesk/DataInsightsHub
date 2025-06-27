'use server';

import { executeQuery } from '@/lib/db';
import type { QueryResult } from '@/lib/types';

export async function runQuery(sqlQuery: string): Promise<QueryResult> {
  try {
    const result = await executeQuery(sqlQuery);
    return result;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error('An unknown error occurred while running the query.');
  }
}
