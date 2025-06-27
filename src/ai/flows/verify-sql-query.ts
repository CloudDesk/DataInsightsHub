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
  databaseSchemaDescription: z.string().describe('A description of the database schema.').optional(),
});
export type VerifySqlQueryInput = z.infer<typeof VerifySqlQueryInputSchema>;

const VerifySqlQueryOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the query is syntactically correct and aligns with the schema if provided.'),
  explanation: z.string().describe('A concise, 2-3 line explanation of the SQL query, including what it does and any potential issues.'),
});
export type VerifySqlQueryOutput = z.infer<typeof VerifySqlQueryOutputSchema>;

export async function verifySqlQuery(input: VerifySqlQueryInput): Promise<VerifySqlQueryOutput> {
  return verifySqlQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifySqlQueryPrompt',
  input: {schema: VerifySqlQueryInputSchema},
  output: {schema: VerifySqlQueryOutputSchema},
  prompt: `You are an expert SQL analyst. Your task is to analyze a given SQL query and provide a concise, 2-3 line explanation.

SQL Query to Verify:
{{{sqlQuery}}}

{{#if databaseSchemaDescription}}
Analyze the query based on the following database schema.
Database Schema Description:
{{{databaseSchemaDescription}}}
Verify syntax, performance, and schema alignment.
{{else}}
Analyze the query for general SQL syntax correctness and potential performance issues. Since no schema was provided, you cannot verify table or column names.
{{/if}}

Set 'isValid' to true if the query is valid (and aligns with the schema if provided), otherwise false.
Provide a concise, 2-3 line explanation.
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
