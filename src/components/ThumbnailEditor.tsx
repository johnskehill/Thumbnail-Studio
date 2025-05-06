import React, { useState, useRef } from 'react'
import { Stage, Layer, Image as KImage, Text as KText } from 'react-konva'
import { v4 as uuid } from 'uuid'
import { ChromePicker } from 'react-color'

interface LayerItem {
  id: string
  type: 'image' | 'text'
  x: number
  y: number
  // for images
  src?: string
  width?: number
  height?: number
  // for text
  text?: string
  fontSize?: number
  fontFamily?: string
  fill?: string
  outline?: { color: string; width: number } | null
}

// Hook to load an image and get its natural size
function useImage(
  url: string | undefined,
  onLoad?: (img: HTMLImageElement) => void
) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  React.useEffect(() => {
    if (!url) return
    const image = new window.Image()
    image.src = url
    image.onload = () => {
      setImg(image)
      onLoad && onLoad(image)
    }
  }, [url])
  return img
}

export default function ThumbnailEditor() {
  const [layers, setLayers] = useState<LayerItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [stageSize, setStageSize] = useState({ width: 600, height: 400 })
  const stageRef = useRef<any>(null)

  // When you pick a file, preload it to get natural dimensions,
  // then scale to fit within maxStage dims, preserving aspect.
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)

    const img = new window.Image()
    img.src = url
    img.onload = () => {
      const maxW = 800
      const maxH = 600
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1)
      const width = img.width * ratio
      const height = img.height * ratio

      // resize stage
      setStageSize({ width, height })

      // add an image layer sized to fit stage
      setLayers((prev) =>
        prev.concat({
          id: uuid(),
          type: 'image',
          x: 0,
          y: 0,
          src: url,
          width,
          height,
          outline: null,
        })
      )
    }
  }

  // Add a default text layer
  const addText = () => {
    setLayers((prev) =>
      prev.concat({
        id: uuid(),
        type: 'text',
        x: 20,
        y: 20,
        text: 'Hello World',
        fontSize: 48,
        fontFamily: 'Arial',
        fill: '#ffffff',
        outline: null,
      })
    )
  }

  // Export stage as PNG
  const exportImage = () => {
    if (!stageRef.current) return
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 })
    const a = document.createElement('a')
    a.download = 'thumbnail.png'
    a.href = uri
    a.click()
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>Thumbnail Craft Studio</h2>
        <p>Use the controls below to upload your image, add text, and export.</p>

        <h3>Controls</h3>
        <input type="file" accept="image/*" onChange={handleFile} />
        <button onClick={addText}>Add Text</button>
        {selectedId && (
          <>
            <h4>Edit Layer</h4>
            {layers.find((l) => l.id === selectedId)?.type === 'text' && (
              <>
                <label>Text color</label>
                <ChromePicker
                  color={layers.find((l) => l.id === selectedId)!.fill!}
                  onChange={(c) =>
                    setLayers((L) =>
                      L.map((layer) =>
                        layer.id === selectedId
                          ? { ...layer, fill: c.hex }
                          : layer
                      )
                    )
                  }
                />
              </>
            )}
            <label>
              <input
                type="checkbox"
                checked={!!layers.find((l) => l.id === selectedId)!.outline}
                onChange={(e) => {
                  setLayers((L) =>
                    L.map((layer) =>
                      layer.id === selectedId
                        ? {
                            ...layer,
                            outline: e.target.checked
                              ? { color: '#ff0000', width: 4 }
                              : null,
                          }
                        : layer
                    )
                  )
                }}
              />{' '}
              Outline
            </label>
          </>
        )}
        <button onClick={exportImage}>Export PNG</button>
      </aside>

      <main className="main">
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          ref={stageRef}
          style={{ background: '#333' }}
        >
          <Layer>
            {layers.map((layer) => {
              if (layer.type === 'image') {
                const img = useImage(layer.src)
                return img ? (
                  <KImage
                    key={layer.id}
                    image={img}
                    x={layer.x}
                    y={layer.y}
                    width={layer.width}
                    height={layer.height}
                    draggable
                    onDragEnd={(e) => {
                      const { x, y } = e.target
                      setLayers((L) =>
                        L.map((l2) =>
                          l2.id === layer.id ? { ...l2, x, y } : l2
                        )
                      )
                    }}
                    stroke={layer.outline?.color}
                    strokeWidth={layer.outline?.width || 0}
                    onClick={() => setSelectedId(layer.id)}
                  />
                ) : null
              } else {
                return (
                  <KText
                    key={layer.id}
                    text={layer.text!}
                    x={layer.x}
                    y={layer.y}
                    fontSize={layer.fontSize}
                    fontFamily={layer.fontFamily}
                    fill={layer.fill}
                    draggable
                    onDragEnd={(e) => {
                      const { x, y } = e.target
                      setLayers((L) =>
                        L.map((l2) =>
                          l2.id === layer.id ? { ...l2, x, y } : l2
                        )
                      )
                    }}
                    stroke={layer.outline?.color}
                    strokeWidth={layer.outline?.width || 0}
                    onClick={() => setSelectedId(layer.id)}
                  />
                )
              }
            })}
          </Layer>
        </Stage>
      </main>
    </div>
  )
}
