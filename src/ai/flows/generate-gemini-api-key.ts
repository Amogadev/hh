'use server';

/**
 * @fileOverview A flow to generate a Gemini API key.
 *
 * - generateGeminiApiKey - A function that generates a Gemini API key.
 * - GenerateGeminiApiKeyInput - The input type for the generateGeminiApiKey function (currently empty).
 * - GenerateGeminiApiKeyOutput - The return type for the generateGeminiApiKey function, which includes the API key.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGeminiApiKeyInputSchema = z.object({});
export type GenerateGeminiApiKeyInput = z.infer<typeof GenerateGeminiApiKeyInputSchema>;

const GenerateGeminiApiKeyOutputSchema = z.object({
  apiKey: z.string().describe('The generated Gemini API key.'),
});
export type GenerateGeminiApiKeyOutput = z.infer<typeof GenerateGeminiApiKeyOutputSchema>;

export async function generateGeminiApiKey(input: GenerateGeminiApiKeyInput): Promise<GenerateGeminiApiKeyOutput> {
  return generateGeminiApiKeyFlow(input);
}

const generateApiKeyPrompt = ai.definePrompt({
  name: 'generateApiKeyPrompt',
  input: {schema: GenerateGeminiApiKeyInputSchema},
  output: {schema: GenerateGeminiApiKeyOutputSchema},
  prompt: `You are an API key generator. Your sole task is to generate a secure, random API key. The API key should be a long, complex string that is difficult to guess.  Do not include any identifying information.

  Generate a new API key:
  `,
});

const generateGeminiApiKeyFlow = ai.defineFlow(
  {
    name: 'generateGeminiApiKeyFlow',
    inputSchema: GenerateGeminiApiKeyInputSchema,
    outputSchema: GenerateGeminiApiKeyOutputSchema,
  },
  async input => {
    const {output} = await generateApiKeyPrompt(input);
    return output!;
  }
);
