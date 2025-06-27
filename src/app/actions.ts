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

export async function fetchSchemaFromUrl(url: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch schema from URL: ${response.statusText}`);
    }
    return response.arrayBuffer();
  } catch (error) {
    console.error('Error fetching schema from URL on server:', error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error('An unknown error occurred while fetching the schema from the URL.');
  }
}
