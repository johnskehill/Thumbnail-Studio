import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KImage, Text as KText } from 'react-konva';
import { v4 as uuid } from 'uuid';
import { ChromePicker } from 'react-color';

interface LayerItem {
  id: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  src?: string;      // for images
  text?: string;     // for text
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  outline?: { color: string; width: number } | null;
}

// Hook to load an HTMLImageElement from a blob URL
function useLoadedImage(url?: string) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) return;
    const image = new window.Image();
    image.src = url;
    image.onload = () => {
      console.log('✅ loaded image', url, image.width, image.height);
      setImg(image);
    };
  }, [url]);
  return img;
}

type LayerImageProps = {
  layer: LayerItem;
  onDrag: (id: string, x: number, y: number) => void;
  onSelect: (id: string) => void;
};
function LayerImage({ layer, onDrag, onSelect }: LayerImageProps) {
  const img = useLoadedImage(layer.src);
  if (!img) return null;
  return (
    <KImage
      image={img}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      draggable
      onDragEnd={e => onDrag(layer.id, e.target.x(), e.target.y())}
      stroke={layer.outline?.color}
      strokeWidth={layer.outline?.width || 0}
      onClick={() => onSelect(layer.id)}
    />
  );
}

type LayerTextProps = {
  layer: LayerItem;
  onDrag: (id: string, x: number, y: number) => void;
  onSelect: (id: string) => void;
};
function LayerText({ layer, onDrag, onSelect }: LayerTextProps) {
  return (
    <KText
      text={layer.text}
      x={layer.x}
      y={layer.y}
      fontSize={layer.fontSize}
      fontFamily={layer.fontFamily}
      fill={layer.fill}
      draggable
      onDragEnd={e => onDrag(layer.id, e.target.x(), e.target.y())}
      stroke={layer.outline?.color}
      strokeWidth={layer.outline?.width || 0}
      onClick={() => onSelect(layer.id)}
    />
  );
}

export default function ThumbnailEditor() {
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<any>(null);

  // Add an image layer
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLayers(l => [
      ...l,
      {
        id: uuid(),
        type: 'image',
        x: 20,
        y: 20,
        width: 400,
        height: 300,
        src: url,
        outline: null,
      },
    ]);
  };

  // Add a text layer
  const addText = () => {
    setLayers(l => [
      ...l,
      {
        id: uuid(),
        type: 'text',
        x: 50,
        y: 50,
        text: 'Hello World',
        fontSize: 48,
        fontFamily: 'Arial',
        fill: '#ffffff',
        outline: null,
      },
    ]);
  };

  // Handler for dragging
  const moveLayer = (id: string, x: number, y: number) => {
    setLayers(layers =>
      layers.map(layer =>
        layer.id === id ? { ...layer, x, y } : layer,
      ),
    );
  };

  // Export as PNG
  const exportImage = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const a = document.createElement('a');
    a.download = 'thumbnail.png';
    a.href = uri;
    a.click();
  };

  const selectedLayer = layers.find(l => l.id === selectedId);

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Sidebar Controls */}
      <div style={{ width: 250, color: '#fff' }}>
        <h3>Controls</h3>
        <input type="file" accept="image/*" onChange={handleFile} />
        <br />
        <br />
        <button onClick={addText}>Add Text</button>
        <br />
        <br />

        {selectedLayer && selectedLayer.type === 'text' && (
          <>
            <h4>Edit Text Layer</h4>
            <label>Text color</label>
            <ChromePicker
              color={selectedLayer.fill!}
              onChange={c => {
                setLayers(layers =>
                  layers.map(layer =>
                    layer.id === selectedId
                      ? { ...layer, fill: c.hex }
                      : layer,
                  ),
                );
              }}
            />
            <br />
            <label>
              <input
                type="checkbox"
                checked={!!selectedLayer.outline}
                onChange={e =>
                  setLayers(layers =>
                    layers.map(layer =>
                      layer.id === selectedId
                        ? {
                            ...layer,
                            outline: e.target.checked
                              ? { color: '#ff0000', width: 4 }
                              : null,
                          }
                        : layer,
                    ),
                  )
                }
              />{' '}
              Outline
            </label>
          </>
        )}

        <br />
        <button onClick={exportImage}>Export PNG</button>
      </div>

      {/* Canvas */}
      <div style={{ flexGrow: 1 }}>
        <Stage
          width={800}
          height={500}
          ref={stageRef}
          style={{ background: '#222', border: '2px solid #444' }}
        >
          <Layer>
            {layers.map(layer =>
              layer.type === 'image' ? (
                <LayerImage
                  key={layer.id}
                  layer={layer}
                  onDrag={moveLayer}
                  onSelect={setSelectedId}
                />
              ) : (
                <LayerText
                  key={layer.id}
                  layer={layer}
                  onDrag={moveLayer}
                  onSelect={setSelectedId}
                />
              ),
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
