interface Image {
  url: string
  thumb: string
  credit: string
  creditLink: string
}

interface Props {
  images: Image[]
  selected: Image | null
  onSelect: (img: Image) => void
}

export default function ImagePicker({ images, selected, onSelect }: Props) {
  if (images.length === 0) return null

  return (
    <div className="space-y-2">
      {selected && (
        <img
          src={selected.url}
          className="w-full h-40 object-cover rounded-xl"
        />
      )}
      <div className="flex gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => onSelect(img)}
            className={`flex-1 rounded-lg overflow-hidden border-2 transition ${
              selected?.url === img.url
                ? 'border-blue-500'
                : 'border-transparent'
            }`}
          >
            <img
              src={img.thumb}
              className="w-full h-12 object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}