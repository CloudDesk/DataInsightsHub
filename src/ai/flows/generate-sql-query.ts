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
import {z} from 'zod';

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

1.  **Report Query**: Generate a SQL query that retrieves detailed or grouped information suitable for a tabular report. The focus is on record-level data or summary values for the requested category only. The report output can show grouped fields or detailed entries based on the nature of the prompt.

2.  **Dashboard Query**: Generate a SQL query that produces aggregated data for a chart/visualization. The output must include both the requested condition and the complementary (i.e., 'Others') for comparison. The query MUST return exactly two rows and two columns.
    *   The first column should be a descriptive text label. The label for the matching records should describe the condition (e.g., 'Age > 30'). The label for non-matching records MUST be 'Others'.
    *   The second column should be the aggregated value (e.g., count, sum).
    *   The first row should contain data for records matching the condition.
    *   The second row should contain data for the 'Others' category.

**Rules:**
*   Use the same user prompt for both queries.
*   Don't simply count rows unless the prompt explicitly asks for a count. Focus on total, sum, count, or category-based aggregation for the dashboard output.

**Examples:**

*   **Prompt:** "Display all drivers who are age greater than 30."
    *   **Report Query Goal:** Show a list of all driver records where age > 30.
    *   **Dashboard Query Goal:** Show a count of drivers with age > 30 and a count of drivers with age ≤ 30.

*   **Prompt:** "Count the drivers who have rating 3 or above."
    *   **Report Query Goal:** Show all driver records where rating ≥ 3.
    *   **Dashboard Query Goal:** A query that returns two rows: one with a count for 'Rating >= 3' and one for 'Others' (rating < 3).

*   **Prompt:** "Display drivers total wallet amount whose status is active."
    *   **Report Query Goal:** Show a single row or grouped result with status = 'active' and the total wallet amount.
    *   **Dashboard Query Goal:** A query that returns two rows: one with the total wallet amount for active drivers and one for the total wallet amount for others (e.g., inactive).

Always keep the report focused and accurate, and make the dashboard visually meaningful through comparison.

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
