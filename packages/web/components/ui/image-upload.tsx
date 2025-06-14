'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  onRemove: () => void
  onImageClick?: () => void
  label?: string
  isMain?: boolean
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  onImageClick,
  label,
  isMain = false,
  disabled = false
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onChange(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{label}</label>
          {isMain && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              メイン
            </span>
          )}
        </div>
      )}

      <Card className={cn(
        "relative group cursor-pointer transition-all duration-200",
        isDragging && "border-blue-500 bg-blue-50",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        <CardContent className="p-0">
          {value ? (
            // Image preview
            <div className="relative aspect-square w-full">
              <img
                src={value}
                alt="Product image"
                className="w-full h-full object-cover rounded-lg cursor-pointer"
                onClick={onImageClick}
              />
              
              {/* Remove button */}
              {!disabled && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Replace overlay */}
              {!disabled && (
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                  onClick={handleClick}
                >
                  <div className="text-white text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm">変更</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Upload area
            <div
              className={cn(
                "aspect-square w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 text-center transition-colors",
                isDragging && "border-blue-500 bg-blue-50",
                !disabled && "hover:border-gray-400 hover:bg-gray-50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              <ImageIcon className="h-8 w-8 text-gray-400 mb-3" />
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">クリックして画像を選択</span>
                <br />
                またはドラッグ&ドロップ
              </div>
              <div className="text-xs text-gray-400">
                PNG, JPG, GIF (最大 10MB)
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </div>
  )
}