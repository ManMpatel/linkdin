import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
)

export interface StyleFingerprint {
  hookStyle:       string
  toneDescription: string
  avgLineLength:   string
  emojiUsage:      string
  ctaStyle:        string
  vocabularyLevel: string
  postStructure:   string
  vibeKeywords:    string[]
  exampleHooks:    string[]
  summary:         string
}

export const extractStyleFromCreators = async (
  creators: Array<{
    imageBase64: string[]
    manualText:  string
    mimeTypes:   string[]
  }>
): Promise<StyleFingerprint> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build content parts — images + text for all creators
    const parts: any[] = []

    creators.forEach((creator, i) => {
      parts.push({ text: `\n--- CREATOR ${i + 1} POSTS ---\n` })

      // Add images
      creator.imageBase64.forEach((b64, j) => {
        parts.push({
          inlineData: {
            mimeType: creator.mimeTypes[j] ?? 'image/jpeg',
            data:     b64,
          },
        })
      })

      // Add manual text if provided
      if (creator.manualText.trim()) {
        parts.push({
          text: `Manual post text from creator ${i + 1}:\n${creator.manualText}`,
        })
      }
    })

    parts.push({
      text: `
You are a LinkedIn content style analyst.

Analyse ALL the creator posts above (images + text) and extract their combined writing style.
These are 2 different creators — blend their styles into ONE unified fingerprint.

Return ONLY valid JSON. No explanation. No markdown. No code blocks.

{
  "hookStyle": "<how they start posts — e.g. bold statement, question, stat, story>",
  "toneDescription": "<overall tone — e.g. direct and punchy, warm and relatable, authoritative>",
  "avgLineLength": "<short 1-5 words / medium 6-12 words / long 13+ words>",
  "emojiUsage": "<none / rare / moderate / frequent>",
  "ctaStyle": "<how they end posts — e.g. direct question, soft suggestion, challenge>",
  "vocabularyLevel": "<simple / conversational / professional / technical>",
  "postStructure": "<description of how they structure posts>",
  "vibeKeywords": ["<3-6 words that describe the overall vibe>"],
  "exampleHooks": ["<2-3 example opening lines in their style>"],
  "summary": "<2-3 sentence summary of their combined style that can be given to an AI writer>"
}`,
    })

    const result = await model.generateContent({ contents: [{ role: 'user', parts }] })
    const raw    = result.response.text().trim()
    const clean  = raw.replace(/```json/g, '').replace(/```/g, '').trim()

    return JSON.parse(clean) as StyleFingerprint
  } catch (error) {
    console.error('Style extractor error:', error)
    // Return default fingerprint if extraction fails
    return {
      hookStyle:       'bold statement or question',
      toneDescription: 'professional and engaging',
      avgLineLength:   'short 1-5 words',
      emojiUsage:      'rare',
      ctaStyle:        'direct question at end',
      vocabularyLevel: 'conversational',
      postStructure:   'hook, value, CTA',
      vibeKeywords:    ['authentic', 'valuable', 'engaging'],
      exampleHooks:    ['Most people get this wrong.', 'Here is what nobody tells you.'],
      summary:         'Write in a direct, conversational tone with short punchy lines.',
    }
  }
}