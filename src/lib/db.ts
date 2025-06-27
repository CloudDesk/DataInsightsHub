'use server';

import { Pool } from 'pg';
import type { QueryResultData } from '@/lib/types';

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT),
  ssl: {
    rejectUnauthorized: false
  }
});

export async function executeQuery(query: string): Promise<QueryResultData[]> {
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw new Error(`Database query failed: ${(error as Error).message}`);
  }
}
