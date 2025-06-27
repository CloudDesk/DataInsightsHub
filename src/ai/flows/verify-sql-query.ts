'use server';
/**
 * @fileOverview Verifies a SQL query against a database schema.
 *
 * - verifySqlQuery - A function that verifies a SQL query.
 * - VerifySqlQueryInput - The input type for the verifySqlQuery function.
 * - VerifySqlQueryOutput - The return type for the verifySqlQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifySqlQueryInputSchema = z.object({
  sqlQuery: z.string().describe('The SQL query to verify.'),
  databaseSchemaDescription: z.string().describe('A description of the database schema.'),
});
export type VerifySqlQueryInput = z.infer<typeof VerifySqlQueryInputSchema>;

const VerifySqlQueryOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the SQL query, including what it does and any potential issues.'),
});
export type VerifySqlQueryOutput = z.infer<typeof VerifySqlQueryOutputSchema>;

export async function verifySqlQuery(input: VerifySqlQueryInput): Promise<VerifySqlQueryOutput> {
  return verifySqlQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifySqlQueryPrompt',
  input: {schema: VerifySqlQueryInputSchema},
  output: {schema: VerifySqlQueryOutputSchema},
  prompt: `You are an expert SQL analyst. Your task is to analyze a given SQL query based on a provided database schema.

Database Schema Description:
{{{databaseSchemaDescription}}}

SQL Query to Verify:
{{{sqlQuery}}}

Please provide a concise explanation of what the query does. Point out any potential syntax errors, performance issues, or parts of the query that do not align with the provided schema. If the query is valid and well-formed, confirm its correctness.
`,
});

const verifySqlQueryFlow = ai.defineFlow(
  {
    name: 'verifySqlQueryFlow',
    inputSchema: VerifySqlQueryInputSchema,
    outputSchema: VerifySqlQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
