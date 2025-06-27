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
  prompt: `You are an expert SQL syntax checker and analyst. Your primary task is to meticulously check a given SQL query for any syntax errors.

SQL Query to Verify:
{{{sqlQuery}}}

**Instructions:**
1.  **Strict Syntax Check:** First, check for any syntax errors, including typos in SQL keywords (e.g., 'Selec' instead of 'SELECT'). This is the most important step. If a syntax error is found, you MUST set 'isValid' to false.
2.  **Schema and Performance Analysis:** If and only if the syntax is perfectly correct, then proceed to analyze it further.
    {{#if databaseSchemaDescription}}
    Analyze the query based on the following database schema.
    Database Schema Description:
    {{{databaseSchemaDescription}}}
    Verify performance and schema alignment (table and column names).
    {{else}}
    Analyze the query for general SQL performance issues. Since no schema was provided, you cannot verify table or column names.
    {{/if}}
3.  **Set Validity:**
    - Set 'isValid' to \`false\` if there is ANY syntax error or if the query does not align with the provided schema.
    - Set 'isValid' to \`true\` ONLY if the query is syntactically perfect and aligns with the schema (if provided).
4.  **Provide Explanation:** Provide a concise, 2-3 line explanation. If the query is invalid, your explanation MUST clearly state the error (e.g., "Syntax error: 'Selec' should be 'SELECT'."). If it's valid, explain what it does and mention any potential performance considerations.
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
