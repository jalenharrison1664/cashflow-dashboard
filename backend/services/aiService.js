const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createError } = require('../middleware/errorHandler');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Try user-configured model first, then reliable project-available fallbacks.
const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-lite-latest',
].filter(Boolean);

const uniqueModels = [...new Set(CANDIDATE_MODELS)];

// Model responses are expected to be JSON, but this parser tolerates accidental markdown wrappers.
const parseModelJson = (text) => {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new SyntaxError('No JSON object found in AI response');
    }
    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  }
};

/**
 * Send structured financial insights to Gemini and return
 * natural language analysis with risks and recommendations.
 * @param {Object} insights - output from computeStructuredInsights()
 */
const generateAIInsights = async (insights) => {
  if (!process.env.GEMINI_API_KEY) {
    throw createError('GEMINI_API_KEY is not configured', 500);
  }

  const revTrend = insights.revenueTrend;
  const expChange = insights.weekly.expensesChange;
  const runway = insights.cashRunway !== null ? `${insights.cashRunway} days` : 'unknown';
  const netFlow = insights.monthly.net;
  const spikes = insights.expenseSpikes.length;

  const prompt = `You are a financial advisor AI. Analyze this business cash flow data and provide actionable insights.

Financial Summary:
- Revenue trend (last 14 days): ${revTrend}
- Weekly expense change: ${expChange}% vs previous week
- Monthly net cash flow: $${netFlow.toFixed(2)}
- Cash runway: ${runway}
- Expense spikes detected (last 30 days): ${spikes} day(s)
- Negative cash flow: ${insights.isNegativeCashFlow ? 'YES' : 'No'}
- Weekly revenue: $${insights.weekly.currRevenue.toFixed(2)}
- Weekly expenses: $${insights.weekly.currExpenses.toFixed(2)}

Respond with EXACTLY this JSON structure (no markdown, no code blocks, raw JSON only):
{
  "summary": "2-3 sentence overview of current financial health",
  "insights": [
    "specific insight about revenue",
    "specific insight about expenses",
    "specific insight about cash flow"
  ],
  "risks": [
    "key risk 1",
    "key risk 2"
  ],
  "recommendations": [
    "actionable recommendation 1",
    "actionable recommendation 2",
    "actionable recommendation 3"
  ],
  "healthScore": <integer 0-100 representing overall financial health>
}`;

  let lastError;

  // Iterate through candidate models so the endpoint still works when one model is unavailable.
  for (const modelName of uniqueModels) {
    console.log(`[AI] Trying model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const parsed = parseModelJson(text);
      console.log(`[AI] ✅ Success with model: ${modelName}`);
      return parsed;
    } catch (err) {
      console.warn(`[AI] ⚠️  Model "${modelName}" failed: ${err.message}`);
      lastError = err;
      // 429 means quota is exhausted — all remaining models will fail too, so bail early.
      if (err.message?.includes('429') || err.message?.toLowerCase().includes('quota')) {
        console.warn('[AI] Quota exhausted — skipping remaining model candidates.');
        break;
      }
    }
  }

  if (lastError instanceof SyntaxError) {
    throw createError('AI returned an unexpected response format. Please try again.', 502);
  }

  const isQuota =
    lastError?.message?.includes('429') || lastError?.message?.toLowerCase().includes('quota');

  if (isQuota) {
    throw createError(
      'Gemini free-tier quota exhausted. Showing rule-based insights instead. Quota resets daily — no key rotation needed.',
      429
    );
  }

  throw createError(
    `Gemini API error: ${lastError?.message || 'Failed to generate insights. Check GEMINI_API_KEY and GEMINI_MODEL.'}`,
    502
  );
};

module.exports = { generateAIInsights };
