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
  reportQuery: z.string().describe('The generated SQL query for a detailed report.'),
  dashboardQuery: z.string().describe('The generated SQL query for a summary dashboard visualization.'),
});
export type GenerateSqlQueryOutput = z.infer<typeof GenerateSqlQueryOutputSchema>;

export async function generateSqlQuery(input: GenerateSqlQueryInput): Promise<GenerateSqlQueryOutput> {
  return generateSqlQueryFlow(input);
}

const generateSqlQueryPrompt = ai.definePrompt({
  name: 'generateSqlQueryPrompt',
  input: {schema: GenerateSqlQueryInputSchema},
  output: {schema: GenerateSqlQueryOutputSchema},
  prompt: `You are an expert SQL query generator. Given a database schema and a natural language prompt, you will generate two separate SQL queries based on the same condition.

1.  **Report Query**: This query should return detailed records that meet the user's condition. The output should include all relevant fields for each matching record.
2.  **Dashboard Query**: This query should return a summary/aggregate count that can be visualized as a simple two-bar chart. The query MUST return exactly two rows and two columns.
    *   The first column should be a descriptive text label for the category. The label for the matching records should be descriptive of the condition (e.g., 'Age > 30'). The label for non-matching records MUST be 'Others'.
    *   The second column should be the count.
    *   The first row should contain the data for the records matching the condition.
    *   The second row should contain the data for the 'Others' category.

**Examples:**

*   **User prompt:** "Display all drivers who are age greater than 30."
    *   **Report Query Goal:** Return all driver records where age > 30.
    *   **Dashboard Query Goal:** A query that returns two rows. The first row with a label like 'Age > 30' and its count. The second row with the label 'Others' and the count of drivers with age <= 30.
*   **User prompt:** "Count the drivers who have rating 3 or above."
    *   **Report Query Goal:** Return all driver records where rating >= 3.
    *   **Dashboard Query Goal:** A query that returns two rows. The first row with a label like 'Rating >= 3' and its count. The second row with the label 'Others' and the count of drivers with rating < 3.
*   **User prompt:** "Count of drivers who has rating between '3' to '5'"
    *   **Report Query Goal:** Return all driver records where rating BETWEEN 3 AND 5.
    *   **Dashboard Query Goal:** A query that returns two rows. The first row with a label like 'Rating between 3 and 5' and its count. The second row with the label 'Others' and the count of all other drivers (rating < 3 OR rating > 5).


Always ensure both queries align with the intent of the user, but structure them for two different use cases: detailed tabular view (report) and high-level visual summary (dashboard).

Database Schema:
{{{schema}}}

Natural Language Prompt:
{{{prompt}}}
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
