// groqClient.ts — Groq API helper (Llama 3) for AI fix suggestions

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export interface AIFixResponse {
  fix: string;
  explanation: string;
  confidence: number;
}

export const getAIFix = async (
  errorMessage: string,
  stackTrace?: string,
  language?: string
): Promise<AIFixResponse | null> => {

  if (!GROQ_API_KEY) {
    console.error('VITE_GROQ_API_KEY is not set in .env');
    return null;
  }

  const prompt = `You are an expert debugger. Analyze this error and provide a fix.

Error: ${errorMessage}
${stackTrace ? `Stack Trace:\n${stackTrace}` : ''}
${language ? `Language/Framework: ${language}` : ''}

Respond ONLY with a valid JSON object, no markdown, no extra text:
{
  "fix": "the exact code fix or solution steps",
  "explanation": "brief explanation of why this error occurs and what the fix does",
  "confidence": 85
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Groq API error:', response.status, err);
      return null;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      console.error('No text in Groq response:', data);
      return null;
    }

    const cleaned = text.replace(/```json|```/g, '').trim();

    try {
      return JSON.parse(cleaned) as AIFixResponse;
    } catch {
      // Fallback if JSON parse fails
      return {
        fix: cleaned,
        explanation: 'AI provided a suggestion.',
        confidence: 75,
      };
    }
  } catch (err) {
    console.error('Groq fetch error:', err);
    return null;
  }
};