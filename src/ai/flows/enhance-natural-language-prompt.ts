// src/ai/flows/enhance-natural-language-prompt.ts
'use server';
/**
 * @fileOverview Enhances a natural language query to generate a better SQL query.
 *
 * - enhanceNaturalLanguagePrompt - A function that enhances the natural language prompt.
 * - EnhanceNaturalLanguagePromptInput - The input type for the enhanceNaturalLanguagePrompt function.
 * - EnhanceNaturalLanguagePromptOutput - The return type for the enhanceNaturalLanguagePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceNaturalLanguagePromptInputSchema = z.object({
  naturalLanguagePrompt: z.string().describe('The natural language prompt to enhance.'),
  databaseSchemaDescription: z.string().describe('A description of the database schema.'),
});
export type EnhanceNaturalLanguagePromptInput = z.infer<typeof EnhanceNaturalLanguagePromptInputSchema>;

const EnhanceNaturalLanguagePromptOutputSchema = z.object({
  enhancedPrompt: z.string().describe('The enhanced natural language prompt.'),
  explanation: z.string().describe('An explanation of the enhancements made.'),
});
export type EnhanceNaturalLanguagePromptOutput = z.infer<typeof EnhanceNaturalLanguagePromptOutputSchema>;

export async function enhanceNaturalLanguagePrompt(input: EnhanceNaturalLanguagePromptInput): Promise<EnhanceNaturalLanguagePromptOutput> {
  return enhanceNaturalLanguagePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceNaturalLanguagePromptPrompt',
  input: {schema: EnhanceNaturalLanguagePromptInputSchema},
  output: {schema: EnhanceNaturalLanguagePromptOutputSchema},
  prompt: `You are an AI assistant that improves natural language prompts for generating SQL queries.

Given the following natural language prompt and database schema description, suggest improvements to the prompt to generate a better SQL query.

Database Schema Description: {{{databaseSchemaDescription}}}

Natural Language Prompt: {{{naturalLanguagePrompt}}}

Provide the enhanced prompt and an explanation of the enhancements made.

Enhanced Prompt:
{{{enhancedPrompt}}}
Explanation:
{{{explanation}}}`,
});

const enhanceNaturalLanguagePromptFlow = ai.defineFlow(
  {
    name: 'enhanceNaturalLanguagePromptFlow',
    inputSchema: EnhanceNaturalLanguagePromptInputSchema,
    outputSchema: EnhanceNaturalLanguagePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
