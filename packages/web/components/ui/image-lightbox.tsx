'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageLightboxProps {
  images: Array<{
    url: string
    title: string
    isMain?: boolean
  }>
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onIndexChange: (index: number) => void
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange
}: ImageLightboxProps) {
  const [scale, setScale] = useState(1)

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]
  
  const handleNext = () => {
    setScale(1)
    onIndexChange((currentIndex + 1) % images.length)
  }

  const handlePrev = () => {
    setScale(1)
    onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1)
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 0.5))
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        handlePrev()
        break
      case 'ArrowRight':
        handleNext()
        break
      case '+':
      case '=':
        handleZoomIn()
        break
      case '-':
        handleZoomOut()
        break
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20"
            onClick={handleNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white hover:bg-opacity-20"
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <div className="text-white px-3 py-2 bg-black bg-opacity-50 rounded-md text-sm">
          {Math.round(scale * 100)}%
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white hover:bg-opacity-20"
          onClick={handleZoomIn}
          disabled={scale >= 3}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-2 rounded-md text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex items-center justify-center max-w-[75vw] max-h-[75vh]">
        <img
          src={currentImage.url}
          alt={currentImage.title}
          className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-pointer"
          style={{ 
            transform: `scale(${scale})`,
            maxWidth: '75vw',
            maxHeight: '75vh'
          }}
          onClick={onClose}
        />
        
        {/* Image title */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{currentImage.title}</h3>
              {currentImage.isMain && (
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded mt-1 inline-block">
                  メイン画像
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 p-2 rounded-lg">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                "relative w-16 h-16 overflow-hidden rounded border-2 transition-all",
                index === currentIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-80"
              )}
              onClick={() => {
                setScale(1)
                onIndexChange(index)
              }}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              {image.isMain && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-bl"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}