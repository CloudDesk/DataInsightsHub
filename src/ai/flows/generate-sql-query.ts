'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating SQL queries from natural language prompts
 * based on a provided database schema.
 *
 * - generateSqlQuery - A function that takes a natural language query and database schema and returns a SQL query.
 * - GenerateSqlQueryInput - The input type for the generateSqlQuery function.
 * - GenerateSqlQueryOutput - The return type for the generateSqlQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSqlQueryInputSchema = z.object({
  schema: z.string().describe('The database schema in a text format.'),
  prompt: z.string().describe('The natural language prompt to convert to SQL.'),
});
export type GenerateSqlQueryInput = z.infer<typeof GenerateSqlQueryInputSchema>;

const GenerateSqlQueryOutputSchema = z.object({
  sqlQuery: z.string().describe('The generated SQL query.'),
});
export type GenerateSqlQueryOutput = z.infer<typeof GenerateSqlQueryOutputSchema>;

export async function generateSqlQuery(input: GenerateSqlQueryInput): Promise<GenerateSqlQueryOutput> {
  return generateSqlQueryFlow(input);
}

const generateSqlQueryPrompt = ai.definePrompt({
  name: 'generateSqlQueryPrompt',
  input: {schema: GenerateSqlQueryInputSchema},
  output: {schema: GenerateSqlQueryOutputSchema},
  prompt: `You are an expert SQL query generator.  Given a database schema and a natural language prompt, you will generate a valid SQL query to answer the prompt.

Database Schema:
{{schema}}

Natural Language Prompt:
{{prompt}}

SQL Query:
`,
});

const generateSqlQueryFlow = ai.defineFlow(
  {
    name: 'generateSqlQueryFlow',
    inputSchema: GenerateSqlQueryInputSchema,
    outputSchema: GenerateSqlQueryOutputSchema,
  },
  async input => {
    const {output} = await generateSqlQueryPrompt(input);
    return output!;
  }
);
