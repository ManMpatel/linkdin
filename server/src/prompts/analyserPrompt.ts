export const analyserPrompt = (
  previousCard: string,
  last7DaysPosts: string
): string => {
  return `You are a LinkedIn content performance analyst.
Analyse the past 7 days of post data and update the intelligence card.

PREVIOUS INTELLIGENCE CARD:
${previousCard}

NEW DATA (last 7 days):
${last7DaysPosts}

RULES:
- Merge new findings with previous card
- New data = 40% weight, previous card = 60% weight
- If weeksCovered is under 4, use 60/40 in favour of new data
- Never grow the card beyond the structure shown
- Be specific in audienceInsight
- Output ONLY valid JSON. No explanation. No markdown.`
}