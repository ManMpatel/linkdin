import { GoogleGenerativeAI } from '@google/generative-ai'
import axios from 'axios'

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
)

export const generateImageQuery = async (
  postContent: string
): Promise<string> => {
  try {
    const model  = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(
      `Write a short 10-word image generation prompt for this LinkedIn post.
Professional, photorealistic style. No text in image.
Return ONLY the prompt, nothing else.

Post: ${postContent.slice(0, 300)}`
    )
    return result.response.text().trim()
  } catch {
    return 'professional business meeting modern office'
  }
}

export const generateImageWithImagen = async (
  prompt: string
): Promise<string | null> => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:generateImages?key=${process.env.GEMINI_API_KEY}`,
      {
        prompt:         { text: prompt },
        numberOfImages: 1,
        aspectRatio:    '16:9',
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )

    const imageData = response.data?.generatedImages?.[0]?.image?.imageBytes
    if (!imageData) return null
    return `data:image/png;base64,${imageData}`
  } catch (error: any) {
    console.error('Imagen error:', error?.response?.data ?? error.message)
    return null
  }
}

export interface UnsplashImage {
  url: string
  thumb: string
  credit: string
  creditLink: string
}

export const searchUnsplashImages = async (
  query: string
): Promise<UnsplashImage[]> => {
  try {
    if (!process.env.UNSPLASH_ACCESS_KEY) return []
    const { data } = await axios.get(
      'https://api.unsplash.com/search/photos',
      {
        params: {
          query,
          per_page:    3,
          orientation: 'landscape',
        },
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    )
    return data.results.map((photo: any) => ({
      url:        photo.urls.regular,
      thumb:      photo.urls.thumb,
      credit:     photo.user.name,
      creditLink: photo.user.links.html,
    }))
  } catch {
    return []
  }
}