import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
)

export const extractTopicTags = async (
  postContent: string
): Promise<string[]> => {
  try {
    const model  = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(
      `Extract 3-5 topic tags from this LinkedIn post.
Return ONLY a JSON array of short topic strings.
Example: ["AI tools", "productivity", "leadership"]
No explanation. No markdown. No code blocks.

Post:
${postContent}`
    )
    const text  = result.response.text().trim()
    const clean = text.replace(/```json|```/g, '').trim()
    const tags  = JSON.parse(clean)
    return Array.isArray(tags) ? tags : []
  } catch (error) {
    console.error('Topic tagger error:', error)
    return []
  }
}