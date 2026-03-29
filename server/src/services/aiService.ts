import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
)

export const generatePost = async (prompt: string): Promise<string> => {
  try {
    const model  = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const text   = result.response.text()
    return text.trim()
  } catch (error) {
    console.error('AI generation error:', error)
    throw new Error('Failed to generate post')
  }
}