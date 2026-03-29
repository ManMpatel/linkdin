interface Article {
  title: string
  description: string
  source: { name: string }
  publishedAt: string
  urlToImage: string | null
}

interface Props {
  article: Article
  onGenerate: () => void
}

export default function NewsCard({ article, onGenerate }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-xs text-blue-600 font-medium mb-1">
            {article.source.name}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">
            {article.title}
          </h3>
          <p className="text-gray-400 text-xs line-clamp-2">
            {article.description}
          </p>
        </div>
        {article.urlToImage && (
          <img
            src={article.urlToImage}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            onError={e => (e.currentTarget.style.display = 'none')}
          />
        )}
      </div>
      <button
        onClick={onGenerate}
        className="mt-3 w-full bg-blue-50 text-blue-700 py-2 rounded-xl text-sm font-medium hover:bg-blue-100 transition"
      >
        ✍️ Generate post from this
      </button>
    </div>
  )
}