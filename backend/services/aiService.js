const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createError } = require('../middleware/errorHandler');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip any accidental markdown code fences
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw createError('AI returned an unexpected response format. Please try again.', 502);
    }
    throw createError(`Gemini API error: ${err.message}`, 502);
  }
};

module.exports = { generateAIInsights };
