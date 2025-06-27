'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a dashboard-specific SQL query
 * from an existing report-style SQL query.
 *
 * - generateDashboardQuery - A function that takes a report query and database schema and returns a dashboard query.
 * - GenerateDashboardQueryInput - The input type for the generateDashboardQuery function.
 * - GenerateDashboardQueryOutput - The return type for the generateDashboardQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateDashboardQueryInputSchema = z.object({
  schema: z.string().describe('The database schema in a text format.'),
  reportQuery: z.string().describe('An existing SQL query that fetches detailed report data.'),
});
export type GenerateDashboardQueryInput = z.infer<typeof GenerateDashboardQueryInputSchema>;

const GenerateDashboardQueryOutputSchema = z.object({
  dashboardQuery: z.string().describe('The generated SQL query for a summary dashboard visualization.'),
});
export type GenerateDashboardQueryOutput = z.infer<typeof GenerateDashboardQueryOutputSchema>;

export async function generateDashboardQuery(input: GenerateDashboardQueryInput): Promise<GenerateDashboardQueryOutput> {
  return generateDashboardQueryFlow(input);
}

const generateDashboardQueryPrompt = ai.definePrompt({
  name: 'generateDashboardQueryPrompt',
  input: {schema: GenerateDashboardQueryInputSchema},
  output: {schema: GenerateDashboardQueryOutputSchema},
  prompt: `You are an expert SQL query generator specializing in creating dashboard visualizations.
You will be given an existing SQL query that is used for a detailed report. Your task is to analyze this report query and generate a new, aggregated SQL query suitable for a dashboard chart.

The new dashboard query MUST return exactly two rows and two columns:
*   The first column should be a descriptive text label. The label for the primary group should describe the main condition of the report query. The label for all other records MUST be 'Others'.
*   The second column should be an aggregated value (e.g., COUNT, SUM).
*   The first row should contain data for records matching the report query's condition.
*   The second row should contain data for the 'Others' category.

**Example:**

*   **Input Report Query:** "SELECT first_name, last_name, age FROM drivers WHERE age > 30"
*   **Analysis:** The query selects drivers older than 30. The dashboard query should count drivers > 30 vs. all other drivers (<= 30).
*   **Generated Dashboard Query Goal:** A query that returns two rows:
    1.  'Age > 30', COUNT(...)
    2.  'Others', COUNT(...)

**Rules:**
*   You MUST use the exact table and column names as provided in the schema.
*   You MUST ONLY use columns explicitly listed in the schema.
*   Infer the primary condition from the WHERE clause of the report query to create the two groups for the dashboard query.
*   If the report query involves aggregation (like SUM or GROUP BY), the dashboard query should provide a comparative aggregation (e.g., summing the target group vs. summing 'Others').

Database Schema:
{{{schema}}}

Existing Report Query:
{{{reportQuery}}}
`,
});

const generateDashboardQueryFlow = ai.defineFlow(
  {
    name: 'generateDashboardQueryFlow',
    inputSchema: GenerateDashboardQueryInputSchema,
    outputSchema: GenerateDashboardQueryOutputSchema,
  },
  async input => {
    const {output} = await generateDashboardQueryPrompt(input);
    return output!;
  }
);
