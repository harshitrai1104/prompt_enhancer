// Direct DeepSeek API request approach
const DEEPSEEK_API_KEY = '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';
const OpenAI = require('openai');
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: DEEPSEEK_API_KEY,
});

export const getAnalysis = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      messages: [
        {
          role: "system",
          content: `You are a Prompt Evaluation Assistant. Your task is to evaluate prompts written by users who want to get better responses from AI assistants or chatbots.

Given a prompt, you must:

1. Evaluate the clarity, completeness, intent, and format of the prompt.
2. Provide a rating between 0 and 100.
3. Identify the issues in the prompt (such as being too vague, too broad, missing details, wrong tone, or unclear target).
4. Provide specific suggestions for improving the prompt.
5. Identify the strengths of the prompt.
6. Rewrite the prompt into an improved version that scores 85% or higher.

Return all this in a valid JSON object with the following structure:
{
  "rating": number,              // rating from 0–100
  "issues": [string],            // list of issues in the original prompt
  "suggestions": [string],       // how to fix those issues
  "strengths": [string],         // list of strengths in the original prompt
  "improvedPrompt": string       // rewritten prompt with higher clarity and completeness
}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error('Invalid API response format');
    }

    const responseContent = completion.choices[0].message.content;
    let analysis;

    try {
      analysis = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError);
      throw new Error('Invalid response format from API');
    }

    // Validate the analysis object structure
    const requiredFields = ['rating', 'issues', 'suggestions', 'strengths', 'improvedPrompt'];
    const missingFields = requiredFields.filter(field => !(field in analysis));

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields in analysis: ${missingFields.join(', ')}`);
    }

    // Ensure arrays are actually arrays
    if (!Array.isArray(analysis.issues)) analysis.issues = [];
    if (!Array.isArray(analysis.suggestions)) analysis.suggestions = [];
    if (!Array.isArray(analysis.strengths)) analysis.strengths = [];

    // Ensure rating is a number between 0 and 100
    analysis.rating = Math.min(100, Math.max(0, Number(analysis.rating) || 0));

    // Ensure improvedPrompt is a string
    analysis.improvedPrompt = String(analysis.improvedPrompt || '');

    return analysis;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
};

