'use server';

import { Pool } from 'pg';
import type { QueryResultData } from '@/lib/types';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    if (!process.env.POSTGRES_USER || !process.env.POSTGRES_HOST || !process.env.POSTGRES_DATABASE || !process.env.POSTGRES_PASSWORD || !process.env.POSTGRES_PORT) {
        throw new Error('Database connection details are missing from environment variables. Please check your .env file.');
    }
    pool = new Pool({
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DATABASE,
      password: process.env.POSTGRES_PASSWORD,
      port: Number(process.env.POSTGRES_PORT),
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

export async function executeQuery(query: string): Promise<QueryResultData[]> {
  try {
    const dbPool = getPool();
    const result = await dbPool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error executing query:', error);
    if (error instanceof Error) {
        if (error.message.includes('password authentication failed') || error.message.includes('connection refused')) {
            throw new Error('Database connection failed. Please check your credentials in the .env file.');
        }
        throw new Error(`Database query failed: ${error.message}`);
    }
    throw new Error('An unknown database error occurred.');
  }
}
