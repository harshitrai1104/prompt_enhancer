// Function to analyze prompts using OpenAI API
export async function getAnalysis(prompt) {
  try {
    // TODO: Replace with your actual OpenAI API key
    const OPENAI_API_KEY = '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';
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
        messages: [
          {
            role: "system",
            content: `You are a Prompt Evaluation Engine. Given a user prompt (input), your task is to generate a detailed and structured report in strict JSON format. Your report should help the user understand the quality of their prompt and how to improve it.

You must return a JSON object with **exactly four keys**:
1. "rating" — a number between 0 and 100 representing how effective the prompt is in terms of clarity, completeness, specificity, and usefulness.
2. "issues" — an array of strings that highlight weaknesses or problems in the prompt (such as vagueness, ambiguity, missing context, bad formatting, grammatical problems, or unclear intent).
3. "suggestions" — an array of actionable suggestions to improve the prompt, aligned directly with the listed issues.
4. "improvedPrompt" — a revised version of the original prompt that would be considered high quality (85%+ score), using clearer structure, full sentences, context, specificity, and formatting where needed.

### Formatting and Style Rules:
- Return only a **valid JSON object**.
- Do not wrap the JSON in code blocks or markdown.
- Ensure **quotes are properly escaped** if needed.
- The 'improvedPrompt' should be fluent, purposeful, and free from ambiguity.
- Keep suggestions **actionable, relevant, and concise**.

Your output JSON should always follow this structure:
{
  "rating": number,
  "issues": [string, ...],
  "suggestions": [string, ...],
  "improvedPrompt": string
}

Example input: "give js questions medium level"

Example output:
{
  "rating": 58,
  "issues": [
    "The prompt is vague and lacks context",
    "No specification of the topics or subcategories within JavaScript",
    "No preferred format mentioned (MCQ, coding challenge, explanation-based, etc.)",
    "Grammatically incomplete and not clear whether it's a request or a command"
  ],
  "suggestions": [
    "Rephrase the prompt as a complete sentence or clear request",
    "Specify what type of JavaScript questions you want (e.g., closures, async, array methods)",
    "Mention the desired format (code snippets, conceptual Q&A, MCQs)",
    "Clarify the purpose: for interview prep, self-practice, quiz generation, etc."
  ],
  "improvedPrompt": "Can you provide a set of medium-difficulty JavaScript questions, including code-based and conceptual questions, covering topics like closures, async behavior, and scope? Please structure them clearly with explanations."
}

Now, evaluate the following user prompt and return your JSON report.
`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);
    
    return {
      rating: analysis.rating,
      issues: analysis.issues,
      suggestions: analysis.suggestions,
      strengths: analysis.strengths,
      improvedPrompt: analysis.improvedPrompt
    };
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
} 